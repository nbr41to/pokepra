/**
 * 各アクションのEV/エクイティ/ポットオッズ/MDFを計算する
 *
 * --- 改善版モデル ---
 * villainレンジ内の「各ハンドのエクイティ」を使い、ベットサイズに応じて
 * villainの継続レンジを動的に再計算する。
 *
 * 1. simulateVsListWithRanks で hero vs villainレンジ全体のper-handエクイティを取得
 * 2. 任意のベットサイズ S に対し、villainがcallするためのpot odds:
 *      villainPotOdds = (S - toCall) / (pot + 2*S - toCall)
 *    villain目線のエクイティ = 1 - heroEquityVsH (tieは2分)
 *    継続ハンド: villainEquityVsH >= villainPotOdds のもの
 * 3. foldFraction = (1 - 継続ハンド数 / 全ハンド数)
 *    heroEquityVsCalled = 継続ハンドに対するhero平均エクイティ
 * 4. EV = foldFraction * pot + (1 - foldFraction) * (heroEqVsCalled*(pot+2S) - (1-heroEqVsCalled)*S)
 *
 * fold:  EV = 0  (既投入chipは sunk cost)
 * check: EV = heroEquity * pot  (簡略化)
 * call:  EV = heroEquity*(pot+toCall) - (1-heroEquity)*toCall
 *
 * これによりベットサイズが大きいほどvillainの継続レンジが強くなり、
 * heroEquityVsCalledが下がる -> 一定サイズで最適点が出てくる。
 */

import {
  simulateVsListEquity,
  simulateVsListWithRanks,
} from "@/lib/wasm-v1/simulation";
import type { CombinedEntry, CombinedPayload } from "@/lib/wasm-v1/types";
import type {
  ActionChoice,
  ActionEvaluation,
  ActionEvMeta,
  ActionKind,
} from "./types";

/** ベットサイズの候補比率 (pot基準) */
const BET_SIZE_RATIOS = [0.33, 0.66, 1.0, 1.5] as const;

export type EvaluateActionsParams = {
  hero: string[];
  board: string[];
  villainRange: string[][];
  pot: number;
  toCall: number;
  heroStack: number;
  villainStack: number;
  /** 残っている相手の数 (1 = heads-up, 2+ = multi-way) */
  numOpponents: number;
  trials?: number;
};

export type EvaluatedActions = {
  heroEquity: number;
  pot: number;
  toCall: number;
  villainRangeSize: number;
  numOpponents: number;
  /** villainレンジのper-hand生データ (デバッグ/Tips用、heads-up basis) */
  perHandData: CombinedEntry[];
  candidates: { choice: ActionChoice; evChips: number; meta?: ActionEvMeta }[];
};

/**
 * 候補アクション一覧を生成
 */
function buildCandidateActions(params: {
  toCall: number;
  pot: number;
  heroStack: number;
  villainStack: number;
}): ActionChoice[] {
  const { toCall, pot, heroStack, villainStack } = params;
  const candidates: ActionChoice[] = [];

  candidates.push({ kind: "fold", amount: 0, label: "Fold" });

  if (toCall === 0) {
    candidates.push({ kind: "check", amount: 0, label: "Check" });
  } else {
    candidates.push({
      kind: "call",
      amount: Math.min(toCall, heroStack),
      label: `Call ${toCall}`,
    });
  }

  const baseAction: ActionKind = toCall === 0 ? "bet" : "raise";
  for (const ratio of BET_SIZE_RATIOS) {
    const callAmount = toCall;
    const newPot = pot + callAmount;
    const sizeOver = newPot * ratio;
    const totalSize = Math.floor(callAmount + sizeOver);
    if (totalSize <= toCall) continue;
    if (totalSize > heroStack) continue;
    candidates.push({
      kind: baseAction,
      amount: totalSize,
      label: `${baseAction === "bet" ? "Bet" : "Raise"} ${totalSize}`,
    });
  }

  const maxBet = Math.min(heroStack, villainStack + toCall);
  if (maxBet > toCall && maxBet > 0) {
    candidates.push({
      kind: "allin",
      amount: maxBet,
      label: `All-in ${maxBet}`,
    });
  }

  return candidates;
}

/**
 * per-handデータからvillainのfold頻度と継続レンジエクイティを算出
 *
 * @param perHandData villainレンジ各ハンドの結果統計
 * @param betSize 対象アクションの賭け金 (chip)
 * @param pot 現在のpot
 * @param toCall ヒーローのtoCall
 */
function estimateVillainResponse(
  perHandData: CombinedEntry[],
  betSize: number,
  pot: number,
  toCall: number,
): {
  foldFraction: number;
  heroEquityVsCalled: number;
  callingHandsCount: number;
  villainPotOdds: number;
} {
  if (perHandData.length === 0 || betSize <= 0) {
    return {
      foldFraction: 0,
      heroEquityVsCalled: 0,
      callingHandsCount: 0,
      villainPotOdds: 0,
    };
  }
  // villainがcallするための必要エクイティ
  // call cost = betSize - toCall (villainが新たに投入する額)
  // call後のpot = pot + 2 * betSize - toCall (toCallの分はすでにpotに含むので二重カウントしない)
  // 単純化: villainPotOdds = (betSize - toCall) / (pot + 2 * betSize - toCall)
  const callCost = Math.max(1, betSize - toCall);
  const finalPot = pot + 2 * betSize - toCall;
  const villainPotOdds = callCost / Math.max(callCost, finalPot);

  let calling = 0;
  let totalHeroEqWhenCalled = 0;
  for (const h of perHandData) {
    if (!h.count) continue;
    const heroEq = (h.win + h.tie / 2) / h.count;
    const villainEq = 1 - heroEq; // tie の取り扱いはhero側に合算済み
    if (villainEq >= villainPotOdds) {
      calling += 1;
      totalHeroEqWhenCalled += heroEq;
    }
  }
  const total = perHandData.length;
  const foldFraction = 1 - calling / total;
  const heroEquityVsCalled = calling > 0 ? totalHeroEqWhenCalled / calling : 0;

  return {
    foldFraction,
    heroEquityVsCalled,
    callingHandsCount: calling,
    villainPotOdds,
  };
}

/** 個別アクションのEV計算 */
function calcActionEv(params: {
  choice: ActionChoice;
  heroEquity: number;
  pot: number;
  toCall: number;
  perHandData: CombinedEntry[];
}): { evChips: number; meta?: ActionEvMeta } {
  const { choice, heroEquity, pot, toCall, perHandData } = params;

  switch (choice.kind) {
    case "fold":
      return { evChips: 0 };
    case "check":
      return { evChips: heroEquity * pot };
    case "call": {
      const totalPot = pot + toCall;
      const ev = heroEquity * totalPot - (1 - heroEquity) * toCall;
      return { evChips: ev };
    }
    case "bet":
    case "raise":
    case "allin": {
      const resp = estimateVillainResponse(
        perHandData,
        choice.amount,
        pot,
        toCall,
      );
      const {
        foldFraction,
        heroEquityVsCalled,
        villainPotOdds,
        callingHandsCount,
      } = resp;
      // foldされた -> 現ポット獲得
      const evFold = pot;
      // call された -> 最終pot vs Hero投入分のEV
      const newPot = pot + 2 * choice.amount - toCall;
      const heroNewlyInvested = choice.amount - toCall;
      const evCalled =
        heroEquityVsCalled * newPot -
        (1 - heroEquityVsCalled) * heroNewlyInvested;
      const ev = foldFraction * evFold + (1 - foldFraction) * evCalled;
      return {
        evChips: ev,
        meta: {
          foldFraction,
          heroEquityVsCalled,
          callingHandsCount,
          villainPotOdds,
        },
      };
    }
  }
}

/**
 * 候補アクション全部のEV計算
 *
 * 残り相手の数 (numOpponents) に応じて勝率を切り替える:
 *  - numOpponents === 1 : heads-up の simulateVsListWithRanks の equity を使う
 *  - numOpponents > 1   : simulateVsListEquity に opponentsCount を渡して
 *                          multi-way の勝率を別途算出し、heroEquity に上書きする
 *
 * per-hand data (相手の継続レンジ推定用) は引き続き heads-up basis で計算する。
 * 多人数戦における相手1人の継続判断は、その相手目線では実質 1v1 判断という近似。
 */
export async function evaluateActions(
  params: EvaluateActionsParams,
): Promise<EvaluatedActions> {
  const {
    hero,
    board,
    villainRange,
    pot,
    toCall,
    heroStack,
    villainStack,
    numOpponents,
  } = params;
  const trials = params.trials ?? 800;
  const opponents = Math.max(1, numOpponents);

  let heroEquity = 0.5;
  let perHandData: CombinedEntry[] = [];
  if (villainRange.length > 0) {
    const payload: CombinedPayload = await simulateVsListWithRanks({
      hero,
      board,
      compare: villainRange,
      trials,
    });
    heroEquity = payload.equity;
    perHandData = payload.data;

    if (opponents > 1) {
      const multiWay = await simulateVsListEquity({
        hero,
        board,
        compare: villainRange,
        opponentsCount: opponents,
        trials,
      });
      heroEquity = multiWay.equity;
    }
  }

  const candidates = buildCandidateActions({
    toCall,
    pot,
    heroStack,
    villainStack,
  });

  const evaluated = candidates.map((choice) => {
    const { evChips, meta } = calcActionEv({
      choice,
      heroEquity,
      pot,
      toCall,
      perHandData,
    });
    return { choice, evChips, meta };
  });

  return {
    heroEquity,
    pot,
    toCall,
    villainRangeSize: villainRange.length,
    numOpponents: opponents,
    perHandData,
    candidates: evaluated,
  };
}

/** EV損失に応じたグレード判定 */
export function gradeByEvLoss(
  evLoss: number,
  pot: number,
): ActionEvaluation["grade"] {
  const ratio = pot > 0 ? evLoss / pot : evLoss;
  if (ratio < 0.01) return "great";
  if (ratio < 0.05) return "good";
  if (ratio < 0.15) return "ok";
  if (ratio < 0.35) return "bad";
  return "terrible";
}

/** 評価結果を作成 */
export function buildEvaluation(params: {
  evaluated: EvaluatedActions;
  pickedChoice: ActionChoice;
}): ActionEvaluation {
  const { evaluated, pickedChoice } = params;
  const {
    heroEquity,
    pot,
    toCall,
    villainRangeSize,
    numOpponents,
    candidates,
  } = evaluated;

  const best = candidates.reduce(
    (acc, cur) => (cur.evChips > acc.evChips ? cur : acc),
    candidates[0],
  );

  const pickedEv = candidates.find(
    (c) =>
      c.choice.kind === pickedChoice.kind &&
      c.choice.amount === pickedChoice.amount,
  );

  const pickedEvChips = pickedEv?.evChips ?? 0;
  const evLoss = Math.max(0, best.evChips - pickedEvChips);

  const potOdds = toCall > 0 ? toCall / (pot + toCall) : 0;
  const mdf = toCall > 0 ? pot / (pot + toCall) : 1;

  return {
    choice: pickedChoice,
    heroEquity,
    villainRangeSize,
    numOpponents,
    pot,
    toCall,
    potOdds,
    mdf,
    requiredEquity: potOdds,
    evChips: pickedEvChips,
    bestChoice: best.choice,
    bestEvChips: best.evChips,
    evLoss,
    grade: gradeByEvLoss(evLoss, pot),
    allCandidates: candidates.map(({ choice, evChips, meta }) => ({
      choice,
      evChips,
      meta,
    })),
  };
}

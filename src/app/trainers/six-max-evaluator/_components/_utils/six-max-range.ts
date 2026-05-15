/**
 * 6max用のポジション別レンジ定義
 *
 * Position番号は pokepra 全体の規約に従う:
 *   1 = SB, 2 = BB, 3 = UTG, 4 = MP, 5 = CO, 6 = BTN
 */

import { getAllCombos } from "@/utils/dealer";
import { expandStartingHands, toHandSymbol } from "@/utils/hand-range";
import type { SixMaxPositionLabel } from "./types";

/** Position番号 -> ラベル */
export function getSixMaxPositionLabel(position: number): SixMaxPositionLabel {
  switch (position) {
    case 1:
      return "SB";
    case 2:
      return "BB";
    case 3:
      return "UTG";
    case 4:
      return "MP";
    case 5:
      return "CO";
    case 6:
      return "BTN";
    default:
      return "BTN";
  }
}

/** Position番号 -> アクション順 (3=UTG が最初, 2=BB が最後) */
export function getSixMaxActionOrder(): number[] {
  // Preflopのアクション順: UTG -> MP -> CO -> BTN -> SB -> BB
  return [3, 4, 5, 6, 1, 2];
}

/**
 * 各ポジションのOpen Raisingレンジ (UTG最初の自由なアクター)
 * - 一般的な6max GTO風の推奨レンジ
 */
const OPEN_RANGES: Record<SixMaxPositionLabel, string> = {
  UTG: "22+,A2s+,K9s+,Q9s+,J9s+,T9s,98s,87s,76s,65s,AJo+,KQo",
  MP: "22+,A2s+,K8s+,Q8s+,J8s+,T8s+,97s+,86s+,75s+,65s,54s,ATo+,KJo+,QJo",
  CO: "22+,A2s+,K2s+,Q5s+,J7s+,T7s+,96s+,85s+,74s+,64s+,53s+,A8o+,KTo+,QTo+,JTo",
  BTN: "22+,A2s+,K2s+,Q2s+,J2s+,T5s+,95s+,84s+,74s+,63s+,53s+,43s,A2o+,K7o+,Q8o+,J8o+,T8o+,98o,87o,76o",
  // SBはオープン or 3betの混合だがここでは簡略化
  SB: "22+,A2s+,K2s+,Q4s+,J6s+,T7s+,96s+,85s+,75s+,64s+,54s,A2o+,K8o+,Q9o+,J9o+,T9o",
  // BBは vs Open のディフェンスレンジ (call/3bet 統合)
  BB: "22+,A2s+,K2s+,Q2s+,J4s+,T5s+,95s+,85s+,74s+,64s+,54s,A2o+,K6o+,Q8o+,J8o+,T8o+,97o+,87o",
};

/**
 * 3betレンジ (Open Raiseに対する3bet)
 */
const THREE_BET_RANGES: Record<SixMaxPositionLabel, string> = {
  UTG: "QQ+,AKs,AKo",
  MP: "JJ+,AQs+,AKo",
  CO: "TT+,AJs+,AQo+",
  BTN: "99+,ATs+,KQs,AJo+",
  SB: "88+,ATs+,KJs+,AJo+,A5s,A4s",
  BB: "88+,ATs+,KJs+,AQo+,A5s,A4s",
};

/**
 * vs Open に対する Call (continueレンジから3betを除いたもの)
 */
const CALL_VS_OPEN_RANGES: Record<SixMaxPositionLabel, string> = {
  UTG: "22-JJ,AQs,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,AQo,AJo,KQo",
  MP: "22-TT,AJs,ATs,KQs,KJs,QJs,JTs,T9s,98s,87s,76s,KQo,QJo,JTo",
  CO: "22-99,ATs,A9s,A8s,A7s,A5s,KTs,K9s,QTs,JTs,T9s,98s,87s,76s,65s,ATo,KJo,QJo,JTo",
  BTN: "22-88,A9s-A2s,K9s,K8s,Q9s,Q8s,J8s,T8s,98s,87s,76s,65s,54s,ATo,KTo,QTo,JTo,T9o",
  SB: "22-77,A9s,A8s,A7s,A5s,A4s,A3s,A2s,K9s,KTs,QTs,JTs,T9s,98s,87s,76s,KQo,QJo,JTo",
  BB: "22-99,A9s-A2s,K9s,KTs,K8s,Q9s,QTs,QJs,J9s,T8s,T9s,98s,87s,76s,65s,54s,A9o-A2o,K9o,QTo,JTo,T9o",
};

/**
 * ハンド文字列のレンジを実カード組み合わせに展開
 */
export function expandRange(
  rangeStr: string,
  exclude: string[] = [],
): string[][] {
  const handSymbols = expandStartingHands(rangeStr);
  const symbolSet = new Set(handSymbols);
  const allCombos = getAllCombos(exclude);

  return allCombos.filter((hand) => {
    const sym = toHandSymbol(hand);
    return symbolSet.has(sym);
  });
}

/** ポジション別のオープンレンジ */
export function getOpenRangeForPosition(position: number): string {
  return OPEN_RANGES[getSixMaxPositionLabel(position)];
}

/** ポジション別の3betレンジ */
export function getThreeBetRangeForPosition(position: number): string {
  return THREE_BET_RANGES[getSixMaxPositionLabel(position)];
}

/** ポジション別の対オープンcallレンジ */
export function getCallVsOpenRangeForPosition(position: number): string {
  return CALL_VS_OPEN_RANGES[getSixMaxPositionLabel(position)];
}

/** ハンドがレンジに含まれるか */
export function isHandInRange(hand: string[], rangeStr: string): boolean {
  const handSymbols = new Set(expandStartingHands(rangeStr));
  return handSymbols.has(toHandSymbol(hand));
}

/**
 * preflop optimal action 判定 (簡易版)
 * - 自分の前にraiseがあれば: 3betレンジは3bet / callレンジはcall / それ以外はfold
 * - 自分が最初の判断者: openレンジはopen-raise / それ以外はfold
 */
export function judgeOptimalPreflopAction(
  hand: string[],
  position: number,
  isFirstToAct: boolean,
): "open-raise" | "3bet" | "call" | "fold" {
  if (isFirstToAct) {
    return isHandInRange(hand, getOpenRangeForPosition(position))
      ? "open-raise"
      : "fold";
  }
  if (isHandInRange(hand, getThreeBetRangeForPosition(position))) return "3bet";
  if (isHandInRange(hand, getCallVsOpenRangeForPosition(position)))
    return "call";
  return "fold";
}

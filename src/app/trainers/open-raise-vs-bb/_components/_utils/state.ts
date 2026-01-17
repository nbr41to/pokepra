import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm/simulation";
import { genHands, getShuffledDeck } from "@/utils/dealer";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  judgeInRange,
} from "@/utils/hand-range";
import { genPositionNumber } from "@/utils/position";

type Street = "preflop" | "flop" | "turn" | "river";
type HeroPostflopAction = "check" | "bet" | "call" | "raise" | "fold";
type VillainAction = "check" | "bet" | "call" | "raise" | "fold";
type ActionHistoryEntry = {
  id: number;
  street: Street;
  actor: "hero" | "bb";
  action: "bet" | "raise";
  amount: number | null;
};

type HeroActions = {
  preflop: {
    action: "open-raise";
    correct: boolean;
  } | null;
  flop: HeroPostflopAction | null;
  turn: HeroPostflopAction | null;
  river: HeroPostflopAction | null;
};

type History = {
  position: number;
  hero: string[];
  villains: string[][];
  board: string[];
  actions: HeroActions;
};

type State = {
  gameId: number; // 初期化してないときは0
  finished: boolean; // ゲーム終了状況
  confirmedHand: boolean; // ハンドを見たかどうか

  settings: {
    people: number; // 人数
    heroStrength: number; // 自分のハンドレンジ強さ
  };

  // game state
  street: Street; // ストリート
  pot: number; // ポット
  stack: number; // 持ち点
  delta: number; // 前回の点数変動

  deck: string[]; // デッキ
  position: number; // ポジション番号
  hero: string[]; // 自分のハンド
  villains: string[][]; // 相手のハンド候補
  board: string[]; // ボード
  actions: HeroActions;

  villainsEq: (number | undefined)[]; // 相手のエクイティ
  villainOpenAction: VillainAction | null;
  villainReaction: VillainAction | null;
  villainBet: number;
  actionHistory: ActionHistoryEntry[];

  // history
  histories: History[];
};

type Actions = {
  initialize: (settings: { people: number; heroStrength: number }) => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  confirmHand: () => void;
  fetchVillainOpenAction: () => Promise<void>;
  postflopAction: (params: {
    street: Street;
    bet: number | "fold";
  }) => Promise<void>;
  clear: () => void;
};

type Store = State & Actions;

const BB_POSITION = 2;
const SB = 0.5;
const BB = 1;
const BB_ANTE = 1;
const OPEN_RAISE = 3;
const CALL_AMOUNT = 2;
const INITIAL_POT = SB + BB + BB_ANTE + OPEN_RAISE + CALL_AMOUNT;
const VILLAIN_BET_SIZES = [25, 40, 60, 80] as const;

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getVillainOpenActionFromEquity = (heroEquity: number) => {
  const villainEquity = clampNumber(1 - heroEquity, 0, 1);

  if (villainEquity < 0.35) {
    return { action: "check" as const, bet: 0 };
  }

  const bet =
    villainEquity > 0.7
      ? VILLAIN_BET_SIZES[3]
      : villainEquity > 0.55
        ? VILLAIN_BET_SIZES[2]
        : villainEquity > 0.45
          ? VILLAIN_BET_SIZES[1]
          : VILLAIN_BET_SIZES[0];

  return { action: "bet" as const, bet };
};

const getVillainReaction = (
  heroEquity: number,
  facingBet: number,
  potSize: number,
) => {
  const clampedBet = Math.max(facingBet, 0);
  if (clampedBet <= 0) return "check" as const;

  const clampedPot = Math.max(potSize, 0);
  const villainEquity = clampNumber(1 - heroEquity, 0, 1);
  const requiredEquity = clampedBet / (clampedPot + clampedBet);

  if (villainEquity < requiredEquity * 0.9) return "fold" as const;
  if (villainEquity > requiredEquity * 1.2) return "raise" as const;
  return "call" as const;
};

const resolveHeroAction = (
  action: "commit" | "fold",
  betValue: number,
  villainOpenAction: VillainAction | null,
  villainBet: number,
): HeroPostflopAction => {
  if (action === "fold") return "fold";

  if (villainOpenAction === "bet") {
    return betValue <= villainBet ? "call" : "raise";
  }

  return betValue <= 0 ? "check" : "bet";
};

const INITIAL_STATE: State = {
  gameId: 0,
  confirmedHand: false,
  finished: false,

  settings: {
    people: 0,
    heroStrength: 0,
  },

  street: "preflop",
  pot: INITIAL_POT,
  stack: 100,
  delta: 0,
  deck: [],
  position: 1,
  hero: [],
  villains: [],
  board: [],

  actions: {
    preflop: null,
    flop: null,
    turn: null,
    river: null,
  },

  villainsEq: [],
  villainOpenAction: null,
  villainReaction: null,
  villainBet: 0,
  actionHistory: [],

  histories: [],
};

const dealOpenRaiseVsBb = (settings: {
  people: number;
  heroStrength: number;
}) => {
  const { people, heroStrength } = settings;
  const position = genPositionNumber(people, [BB_POSITION]);
  let hero = genHands(heroStrength);

  while (!judgeInRange(hero, position, people)) {
    hero = genHands(heroStrength);
  }

  const villain = genHands(heroStrength, hero);
  const deck = getShuffledDeck([...hero, ...villain]);

  return {
    position,
    hero,
    villains: [villain],
    deck,
    board: [],
    preflopCorrect: judgeInRange(hero, position, people),
  };
};

const useOpenRaiseVsBbStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  /**
   * 初期設定
   */
  initialize: (settings) => {
    const deal = dealOpenRaiseVsBb(settings);

    set({
      ...deal,
      settings,
      gameId: Date.now(),
      finished: false,
      confirmedHand: false,
      delta: 0,
      street: "preflop",
      pot: INITIAL_STATE.pot,
      actions: {
        ...INITIAL_STATE.actions,
        preflop: { action: "open-raise", correct: deal.preflopCorrect },
      },
      villainsEq: [],
      villainOpenAction: null,
      villainReaction: null,
      villainBet: 0,
      actionHistory: [],
    });
  },

  /**
   * ゲームを開始
   */
  shuffleAndDeal: () => {
    const { settings } = get();
    const deal = dealOpenRaiseVsBb(settings);

    set({
      ...deal,
      gameId: Date.now(),
      finished: false,
      street: "preflop",
      delta: 0,
      confirmedHand: false,
      actions: {
        ...INITIAL_STATE.actions,
        preflop: { action: "open-raise", correct: deal.preflopCorrect },
      },
      pot: INITIAL_STATE.pot,
      villainsEq: [],
      villainOpenAction: null,
      villainReaction: null,
      villainBet: 0,
      actionHistory: [],
    });
  },

  /**
   * ハンドをオープン
   */
  confirmHand: () => {
    const { deck, board, actions } = get();
    if (board.length > 0) {
      set({ confirmedHand: true });
      return;
    }

    const nextBoard = deck.splice(0, 3);

    set({
      confirmedHand: true,
      street: "flop",
      deck,
      board: nextBoard,
      actions: {
        ...actions,
        preflop: actions.preflop ?? { action: "open-raise", correct: true },
      },
      villainOpenAction: null,
      villainReaction: null,
      villainBet: 0,
      actionHistory: [],
    });
  },

  /**
   * BBのオープンアクションを取得
   */
  fetchVillainOpenAction: async () => {
    const {
      hero,
      board,
      settings,
      confirmedHand,
      finished,
      street,
      villainOpenAction,
      pot,
      actionHistory,
    } = get();
    if (!confirmedHand || finished || street === "preflop") return;
    if (villainOpenAction !== null) return;

    if (street === "flop") {
      set(() => ({
        villainOpenAction: "check",
        villainReaction: null,
        villainBet: 0,
      }));
      return;
    }

    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: getHandsInRange(
        getRangeStrengthByPosition(BB_POSITION, settings.people),
        [...hero, ...board],
      ),
      trials: 100,
    });

    const { action, bet } = getVillainOpenActionFromEquity(result.equity);
    const nextPot = action === "bet" ? pot + bet : pot;
    const historyEntry: ActionHistoryEntry | null =
      action === "bet"
        ? {
            id: Date.now(),
            street,
            actor: "bb",
            action: "bet",
            amount: bet,
          }
        : null;
    set(() => ({
      villainOpenAction: action,
      villainReaction: null,
      villainBet: bet,
      pot: nextPot,
      actionHistory: historyEntry
        ? [...actionHistory, historyEntry]
        : actionHistory,
    }));
  },

  /**
   * ポストフロップのアクション
   */
  postflopAction: async (params) => {
    const { street: currentStreet, bet } = params;
    const {
      stack,
      hero,
      villains,
      deck,
      board,
      actions,
      villainOpenAction,
      villainBet,
      settings,
      pot,
      actionHistory,
    } = get();
    const safeStack = Number.isFinite(stack) ? stack : 0;
    const rawBetValue =
      bet === "fold" ? 0 : clampNumber(Number(bet), 0, Math.max(safeStack, 0));
    let betValue = rawBetValue;
    if (villainOpenAction !== "bet" && betValue > 0) {
      betValue = Math.min(Math.max(betValue, 1), safeStack);
    }
    if (villainOpenAction === "bet" && betValue > villainBet) {
      const minRaiseTo = villainBet * 2;
      if (safeStack >= minRaiseTo) {
        betValue = Math.max(betValue, minRaiseTo);
      } else {
        betValue = Math.min(villainBet, safeStack);
      }
    }
    const heroAction = resolveHeroAction(
      bet === "fold" ? "fold" : "commit",
      betValue,
      villainOpenAction,
      villainBet,
    );
    const heroContribution =
      heroAction === "call"
        ? Math.min(villainBet, safeStack)
        : heroAction === "bet" || heroAction === "raise"
          ? betValue
          : 0;
    let nextPot = pot + heroContribution;
    const nextStack = safeStack - heroContribution;
    const baseHistoryId = Date.now();
    const historyEntries: ActionHistoryEntry[] = [];
    if (heroAction === "bet" || heroAction === "raise") {
      historyEntries.push({
        id: baseHistoryId,
        street: currentStreet,
        actor: "hero",
        action: heroAction,
        amount: heroContribution,
      });
    }

    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: Array.from(
        new Set([
          ...getHandsInRange(
            getRangeStrengthByPosition(BB_POSITION, settings.people),
            [...hero, ...board],
          ),
          ...villains,
        ]),
      ),
      trials: 100,
    });

    const STREET_W = { preflop: 0, flop: 0.9, turn: 1.1, river: 1.5 } as const;

    const scoreBetValue =
      heroAction === "call"
        ? villainBet
        : heroAction === "check"
          ? 0
          : betValue;
    const compareCount = result.data.length;
    const rare = compareCount
      ? result.data.findIndex((data) => data.hand === result.hand) /
        compareCount
      : 1;
    const compareEquityAverage = compareCount
      ? result.data.reduce((acc, cur) => acc + cur.equity, 0) / compareCount
      : 0;
    const villainRequiredEq = scoreBetValue / (pot + scoreBetValue); // 相手の必要勝率
    const canFold = compareEquityAverage < villainRequiredEq;

    if (heroAction === "fold") {
      const deltaScore =
        Math.abs(
          Math.floor(
            ((result.equity - compareEquityAverage) *
              10 *
              STREET_W[currentStreet]) /
              (rare < 0.1 ? 0.5 : rare < 0.3 ? 0.7 : 1),
          ),
        ) * (canFold ? 1 : -1);

      set(() => ({
        delta: deltaScore,
        stack: nextStack,
        actions: {
          ...actions,
          [currentStreet]: heroAction,
        },
        finished: true,
        villainReaction: null,
        pot: nextPot,
      }));

      return;
    }

    const deltaScore =
      Math.abs(
        Math.floor(
          ((result.equity - compareEquityAverage) *
            10 *
            STREET_W[currentStreet]) /
            (rare < 0.1 ? 0.5 : rare < 0.3 ? 0.7 : 1),
        ),
      ) * (canFold ? 1 : -1);

    let newStack = nextStack;

    const newCard = deck.splice(0, 1)[0];

    const newVillainsEq = villains.map(
      (villainHand) =>
        result.data.find((data) => data.hand === villainHand.join(" "))?.equity,
    );
    const potAfterHero = nextPot;
    const facingBet =
      villainOpenAction === "bet"
        ? Math.max(betValue - villainBet, 0)
        : betValue;
    const villainReaction =
      heroAction === "check"
        ? "check"
        : heroAction === "call"
          ? "call"
          : getVillainReaction(result.equity, facingBet, potAfterHero);
    if (villainReaction === "raise") {
      historyEntries.push({
        id: baseHistoryId + 1,
        street: currentStreet,
        actor: "bb",
        action: "raise",
        amount: null,
      });
    }
    if (heroAction === "bet" || heroAction === "raise") {
      if (villainReaction === "call" || villainReaction === "raise") {
        const villainContribution =
          villainOpenAction === "bet"
            ? Math.max(heroContribution - villainBet, 0)
            : heroContribution;
        nextPot += villainContribution;
      }
    }
    if (villainReaction === "fold") {
      newStack += nextPot;
    }
    const finalStack = Number.isFinite(newStack) ? newStack : 0;

    const handEnded = currentStreet === "river" || villainReaction === "fold";
    const nextStreet =
      currentStreet === "flop"
        ? "turn"
        : currentStreet === "turn"
          ? "river"
          : "river";

    set(() => ({
      street: handEnded ? currentStreet : nextStreet,
      stack: finalStack,
      delta: deltaScore,
      actions: {
        ...actions,
        [currentStreet]: heroAction,
      },
      villainsEq: newVillainsEq,
      villainOpenAction: null,
      villainBet: 0,
      villainReaction,
      pot: nextPot,
      actionHistory:
        historyEntries.length > 0
          ? [...actionHistory, ...historyEntries]
          : actionHistory,
      ...(handEnded ? {} : { board: [...board, newCard], deck }),
      finished: handEnded,
    }));
  },

  /**
   * 初期化
   */
  clear: () => {
    set(INITIAL_STATE);
  },
}));

export { useOpenRaiseVsBbStore };

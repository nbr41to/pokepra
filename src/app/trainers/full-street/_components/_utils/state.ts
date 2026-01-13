import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm/simulate-vs-list-equity";
import { shuffleAndDeal } from "@/utils/dealer";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  judgeInRange,
} from "@/utils/hand-range";

type Street = "preflop" | "flop" | "turn" | "river";
type PreflopAction = "open-raise" | "fold";
type HeroActions = {
  preflop: {
    action: PreflopAction;
    correct: boolean;
  } | null;
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;
};
type History = {
  position: number;
  hero: string[];
  villains: string[][];
  board: string[];
  actions: HeroActions;
  report: any;
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

  // history
  histories: History[];
};

type Actions = {
  initialize: (settings: { people: number; heroStrength: number }) => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  confirmHand: () => void;
  preflopAction: (action: PreflopAction) => void;
  postflopAction: (params: {
    street: Street;
    bet: number | "fold";
  }) => Promise<void>;
  clear: () => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  gameId: 0,
  confirmedHand: false,
  finished: false,

  settings: {
    people: 0,
    heroStrength: 0,
  },

  street: "preflop",
  pot: 100,
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

  histories: [],
};

const useHoldemStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  /**
   * 初期設定
   */
  initialize: (settings) => {
    const { people, heroStrength } = settings;

    set({
      ...shuffleAndDeal({ people, heroStrength }),
      settings,
      gameId: Date.now(),
    });
  },

  /**
   * ゲームを開始
   */
  shuffleAndDeal: () => {
    const {
      settings: { people, heroStrength },
    } = get();

    set({
      ...shuffleAndDeal({ people, heroStrength }),
      gameId: Date.now(),
      finished: false,
      street: "preflop",
      delta: 0,
      confirmedHand: false,
      actions: INITIAL_STATE.actions,
    });
  },

  /**
   * ハンドをオープン
   */
  confirmHand: () => {
    set({ confirmedHand: true });
  },

  /**
   * プリフロップのアクション
   */
  preflopAction: (action: PreflopAction) => {
    const { position, hero, deck, stack, actions } = get();
    const inRange = judgeInRange(hero, position); // 今のPositionのレンジ強さで判定
    const correct = action === "open-raise" ? inRange : !inRange;
    const amount = correct ? 2 : -2;

    if (action === "fold") {
      set({
        actions: { ...actions, preflop: { action, correct } },
        stack: stack + amount,
        delta: amount,
        finished: true,
      });
    } else {
      const board = deck.splice(0, 3);

      set({
        actions: { ...actions, preflop: { action, correct } },
        stack: stack + amount,
        street: "flop",
        deck,
        board,
        delta: amount,
      });
    }
  },

  /**
   * ポストフロップのアクション
   */
  postflopAction: async (params) => {
    const { street: currentStreet, bet } = params;
    const { stack, hero, position, deck, board, actions } = get();

    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: getHandsInRange(getRangeStrengthByPosition(position), [
        ...hero,
        ...board,
      ]),
      trials: 1000,
    });

    if (bet === "fold") {
      set(() => ({
        delta: Number((result.equity * 100).toFixed(2)),
        actions: {
          ...actions,
          [currentStreet]: "fold",
        },
        finished: true,
      }));

      return;
    }

    const STREET_W = { preflop: 0, flop: 0.9, turn: 1.1, river: 1.5 } as const;

    const rare =
      result.data.findIndex((data) => data.hand === result.hand) /
      result.data.length;
    const compareEquityAverage =
      result.data.reduce((acc, cur) => acc + cur.equity, 0) /
      result.data.length;
    const villainRequiredEq = bet / (100 + bet); // 相手の必要勝率

    const canFold = compareEquityAverage < villainRequiredEq;

    const deltaScore =
      Math.abs(
        Math.floor(
          ((result.equity - compareEquityAverage) *
            10 *
            STREET_W[currentStreet]) /
            (rare < 0.1 ? 0.5 : rare < 0.3 ? 0.7 : 1),
        ),
      ) * (canFold ? 1 : -1);

    const newStack = stack + deltaScore;

    const newCard = deck.splice(0, 1)[0];

    set(() => ({
      street:
        currentStreet === "flop"
          ? "turn"
          : currentStreet === "turn"
            ? "river"
            : "river",
      stack: newStack,
      delta: deltaScore,
      actions: {
        ...actions,
        [currentStreet]: "commit",
      },
      ...(currentStreet === "river" ? {} : { board: [...board, newCard] }),
      finished: currentStreet === "river",
    }));
  },

  /**
   * 初期化
   */
  clear: () => {
    set(INITIAL_STATE);
  },
}));

export { useHoldemStore };

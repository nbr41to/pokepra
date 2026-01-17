import { create } from "zustand";
import INITIAL_OPEN_RANGES from "@/data/initial-open-ranges.json";
import type { EquityPayload, RangeVsRangePayload } from "@/lib/wasm/simulation";
import {
  simulateRangeVsRangeEquity,
  simulateVsListEquity,
} from "@/lib/wasm/simulation";
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
};

type State = {
  gameId: number; // 初期化してないときは0
  finished: boolean; // ゲーム終了状況

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
  story: {
    hero: EquityPayload;
    range: RangeVsRangePayload;
  }[];
};

type Actions = {
  initialize: (settings: { people: number; heroStrength: number }) => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  analyzeEquity: (board: string[]) => Promise<void>;
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
  story: [],
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
      actions: INITIAL_STATE.actions,
      story: [],
    });
  },

  /**
   * 解析
   */
  analyzeEquity: async (board: string[]) => {
    const { position, hero, story } = get();

    const [heroEquity, rangeEquities] = await Promise.all([
      // Hero vs Range
      simulateVsListEquity({
        board: board,
        hero: hero,
        compare: getHandsInRange(2, [...hero, ...board]),
        trials: 100,
      }),
      // Range vs Range
      simulateRangeVsRangeEquity({
        board: board,
        heroRange:
          INITIAL_OPEN_RANGES[getRangeStrengthByPosition(position) - 1], // Heroのレンジ
        villainRange: INITIAL_OPEN_RANGES[getRangeStrengthByPosition(2) - 1], // BBのレンジ
        trials: 10,
      }),
    ]);

    set({
      story: [...story, { hero: heroEquity, range: rangeEquities }],
    });
  },

  /**
   * プリフロップのアクション
   */
  preflopAction: async (action: PreflopAction) => {
    const { position, hero, deck, actions, analyzeEquity } = get();
    const inRange = judgeInRange(hero, position); // 今のPositionのレンジ強さで判定
    const correct = action === "open-raise" ? inRange : !inRange;

    if (action === "fold") {
      set({
        actions: { ...actions, preflop: { action, correct } },
        finished: true,
      });
    } else {
      const board = deck.splice(0, 3);
      await analyzeEquity(board);

      set({
        actions: { ...actions, preflop: { action, correct } },
        street: "flop",
        deck,
        board,
      });
    }
  },

  /**
   * ポストフロップのアクション
   */
  postflopAction: async (params) => {
    const { street: currentStreet, bet } = params;
    const { deck, board, actions, analyzeEquity } = get();
    const newCard = deck.splice(0, 1)[0];
    await analyzeEquity([...board, newCard]);

    if (bet === "fold") {
      set(() => ({
        actions: {
          ...actions,
          [currentStreet]: "fold",
        },
        finished: true,
      }));

      return;
    }

    set(() => ({
      street:
        currentStreet === "flop"
          ? "turn"
          : currentStreet === "turn"
            ? "river"
            : "river",
      actions: {
        ...actions,
        [currentStreet]: "commit",
      },
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

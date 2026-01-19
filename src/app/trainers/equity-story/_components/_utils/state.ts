import { create } from "zustand";
import INITIAL_OPEN_RANGES from "@/data/initial-open-ranges.json";
import type { EquityPayload, RangeVsRangePayload } from "@/lib/wasm/simulation";
import {
  simulateRangeVsRangeEquity,
  simulateVsListEquity,
} from "@/lib/wasm/simulation";
import { shuffleAndDeal } from "@/utils/dealer";
import {
  getHandsByStrength,
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
  disableBoardAnimation: boolean;
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
  rewindStreet: () => void;
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
  disableBoardAnimation: false,
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
      disableBoardAnimation: false,
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
      disableBoardAnimation: false,
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
        compare: getHandsByStrength(2, [...hero, ...board]),
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
    const { position, hero, deck, actions, analyzeEquity, story } = get();
    const inRange = judgeInRange(hero, position); // 今のPositionのレンジ強さで判定
    const correct = action === "open-raise" ? inRange : !inRange;

    if (action === "fold") {
      set({
        actions: { ...actions, preflop: { action, correct } },
        finished: true,
        disableBoardAnimation: false,
      });
    } else {
      const board = deck.splice(0, 3);
      if (!story[0]) {
        await analyzeEquity(board);
      }

      set({
        actions: { ...actions, preflop: { action, correct } },
        street: "flop",
        deck,
        board,
        disableBoardAnimation: false,
      });
    }
  },

  /**
   * ポストフロップのアクション
   */
  postflopAction: async (params) => {
    const { street: currentStreet, bet } = params;
    const { deck, board, actions, analyzeEquity, story } = get();
    const newCard = deck.splice(0, 1)[0];
    const targetIndex = currentStreet === "flop" ? 1 : 2;
    if (!story[targetIndex]) {
      await analyzeEquity([...board, newCard]);
    }

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
      ...(currentStreet === "river"
        ? {}
        : { board: [...board, newCard], deck }),
      actions: {
        ...actions,
        [currentStreet]: "commit",
      },
      finished: currentStreet === "river",
      disableBoardAnimation: false,
    }));
  },

  rewindStreet: () => {
    const { street, deck, board, actions, finished } = get();
    if (street === "preflop" || street === "flop") return;
    const nextBoard = [...board];
    const removed = nextBoard.pop();
    const nextDeck = removed ? [removed, ...deck] : deck;

    set(() => ({
      street: street === "river" ? "turn" : "flop",
      board: nextBoard,
      deck: nextDeck,
      actions: {
        ...actions,
        [street]: null,
      },
      finished: finished && street === "river" ? false : finished,
      disableBoardAnimation: true,
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

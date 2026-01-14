import { create } from "zustand";
import PREFLOP_RANKING from "@/data/preflop-hand-ranking.json";
import { simulateVsListWithRanks } from "@/lib/wasm/simulate-vs-list-with-ranks";
import type { RankOutcomeResults } from "@/lib/wasm/simulation";
import { shuffleAndDeal } from "@/utils/dealer";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  judgeInRange,
  toHandSymbol,
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

  // history
  histories: History[];
  resultHistories: {
    equity: number;
    rankOutcome: RankOutcomeResults | null;
    count: number | null;
  }[];
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

  villainsEq: [],

  histories: [],
  resultHistories: [],
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
      resultHistories: [],
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
    const { position, hero, deck, actions } = get();
    const inRange = judgeInRange(hero, position); // 今のPositionのレンジ強さで判定
    const correct = action === "open-raise" ? inRange : !inRange;

    const equity = PREFLOP_RANKING.find((h) => h.hand === toHandSymbol(hero))
      ?.player2 as number;

    if (action === "fold") {
      set({
        actions: { ...actions, preflop: { action, correct } },
        finished: true,
        resultHistories: [{ equity, rankOutcome: null, count: null }],
      });
    } else {
      const board = deck.splice(0, 3);

      set({
        actions: { ...actions, preflop: { action, correct } },
        street: "flop",
        deck,
        board,
        resultHistories: [
          { equity: equity / 100, rankOutcome: null, count: null },
        ],
      });
    }
  },

  /**
   * ポストフロップのアクション
   */
  postflopAction: async (params) => {
    const { street: currentStreet, bet } = params;
    const { hero, villains, position, deck, board, actions, resultHistories } =
      get();

    const result = await simulateVsListWithRanks({
      hero: hero,
      board: board,
      compare: Array.from(
        new Set([
          ...getHandsInRange(getRangeStrengthByPosition(position), [
            ...hero,
            ...board,
          ]),
          ...villains,
        ]),
      ),
      trials: 1000,
    });

    const newCard = deck.splice(0, 1)[0];

    const newVillainsEq = villains.map((villainHand) => {
      const hand = result.data.find(
        (data) => data.hand === villainHand.join(" "),
      );
      if (!hand) return 0;
      const equity = (hand.win + hand.tie / 2) / hand.count;

      return equity;
    });

    const heroData = result.data.find((data) => data.hand === hero.join(" "));

    if (bet === "fold") {
      set(() => ({
        actions: {
          ...actions,
          [currentStreet]: "fold",
        },
        finished: true,
        resultHistories: [
          ...resultHistories,
          {
            equity: result.equity,
            rankOutcome: heroData ? heroData.results : null,
            count: heroData ? heroData.count : null,
          },
        ],
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
      villainsEq: newVillainsEq,
      ...(currentStreet === "river"
        ? {}
        : { board: [...board, newCard], deck }),
      finished: currentStreet === "river",
      resultHistories: [
        ...resultHistories,
        {
          equity: result.equity,
          rankOutcome: heroData ? heroData.results : null,
          count: heroData ? heroData.count : null,
        },
      ],
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

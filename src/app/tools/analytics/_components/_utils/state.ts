import { create } from "zustand";
import type { EquityPayload, RangeVsRangePayload } from "@/lib/wasm/simulation";
import { getRandomCards, shuffleAndDeal } from "@/utils/dealer";

type Street = "preflop" | "flop" | "turn" | "river";

type State = {
  initialized: boolean;
  settings: {
    people: number; // 人数
    heroStrengthLimit: number; // 自分のハンドレンジの下限
  };

  // game state
  position: number; // ポジション番号
  street: Street; // ストリート
  hero: string[]; // 自分のハンド
  villains: string[][]; // 相手のハンド候補
  board: string[]; // ボード
  boardHistory: string[]; // ボード履歴

  disableBoardAnimation: boolean;

  // history
  analyticsHistory: {
    heroEquity: EquityPayload;
    heroRange: EquityPayload;
    villainRange: RangeVsRangePayload;
  }[];
};

type Actions = {
  initialize: (settings: { people: number; heroStrengthLimit: number }) => void;
  shuffleAndDeal: () => void;
  onAdvance: () => void;
  onRetreat: () => void;
  clear: () => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  settings: {
    people: 0,
    heroStrengthLimit: 0,
  },

  street: "preflop",
  position: 1,
  hero: [],
  villains: [],
  board: [],
  boardHistory: [],
  disableBoardAnimation: false,

  analyticsHistory: [],
};

const useHoldemStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  /**
   * 初期設定
   */
  initialize: (settings) => {
    const { people, heroStrengthLimit } = settings;

    set({
      initialized: true,
      ...shuffleAndDeal({ people, heroStrength: heroStrengthLimit }),
      settings,
    });
  },

  /**
   * ゲームを開始
   */
  shuffleAndDeal: () => {
    const {
      settings: { people, heroStrengthLimit },
    } = get();

    set({
      ...INITIAL_STATE,
      ...shuffleAndDeal({ people, heroStrength: heroStrengthLimit }),
      street: "preflop",
      initialized: true,
      settings: { people, heroStrengthLimit },
    });
  },

  /**
   * 次のストリートへ進む
   */

  onAdvance: () => {
    const { street, hero, villains, board, boardHistory } = get();

    if (street === "river") return;

    let nextStreet: Street;
    const newCards = getRandomCards(5, [...hero, ...villains.flat(), ...board]);
    // boardHistoryが5枚になるまでnewCardsから追加
    const newBoardHistory = [...boardHistory];
    while (newBoardHistory.length < 5) {
      newBoardHistory.push(newCards[newBoardHistory.length]);
    }

    if (street === "preflop") {
      nextStreet = "flop";
      set({ board: newBoardHistory.slice(0, 3) });
    } else if (street === "flop") {
      nextStreet = "turn";
      set({ board: newBoardHistory.slice(0, 4) });
    } else {
      nextStreet = "river";
      set({ board: newBoardHistory.slice(0, 5) });
    }

    set({
      street: nextStreet,
      boardHistory: newBoardHistory,
      disableBoardAnimation: false,
    });
  },

  /**
   * 前のストリートへ戻る
   */
  onRetreat: () => {
    const { street, board } = get();

    if (street === "preflop") return;

    let prevStreet: Street;
    let newBoard: string[] = [];

    if (street === "river") {
      prevStreet = "turn";
      newBoard = board.slice(0, 4);
    } else if (street === "turn") {
      prevStreet = "flop";
      newBoard = board.slice(0, 3);
    } else {
      prevStreet = "preflop";
      newBoard = [];
    }

    set({
      street: prevStreet,
      board: newBoard,
      disableBoardAnimation: true,
    });
  },

  /**
   * 初期化
   */
  clear: () => {
    set(INITIAL_STATE);
  },
}));

export { useHoldemStore };

import { create } from "zustand";
import type { EquityPayload } from "@/lib/wasm/simulation";
import { genHands, getShuffledDeck } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";

const PEOPLE = 9;
const DEFAULT_TIER = 6;

type Street = "flop" | "turn" | "river";

type History = {
  hand: string[];
  position: number;
  board: string[];
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;
  equity: number;
};

type State = {
  initialized: boolean;

  street: Street; // ストリート
  stack: number; // 持ち点
  delta: number; // 前回のスコア変動

  deck: string[]; // デッキ

  position: number; // ポジション番号
  hero: string[]; // 自分のハンド
  confirmedHand: boolean; // ハンドを見たかどうか
  board: string[]; // ボード

  // action
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;

  // history
  histories: History[];
};

type Actions = {
  reset: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  confirmHand: () => void;
  postflopAction: (
    street: Street,
    action: "commit" | "fold",
    result: EquityPayload,
    betAmount?: number,
  ) => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  street: "flop",
  stack: 100,
  delta: 0,
  position: 1,
  hero: [],
  deck: [],
  board: [],

  confirmedHand: false,
  flop: null,
  turn: null,
  river: null,

  histories: [],
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  reset: () => {
    set(() => ({ ...INITIAL_STATE }));
  },
  shuffleAndDeal: (options?: { tier?: number; people?: number }) => {
    const tier = options?.tier ?? DEFAULT_TIER;
    const people = options?.people ?? PEOPLE;

    const { stack } = get();

    const hero = genHands(tier);
    const deck = getShuffledDeck(hero);

    set(() => ({
      ...INITIAL_STATE,
      position: genPositionNumber(people),
      hero: hero,
      deck: deck,
      stack,
      initialized: true,
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    const { deck } = get();
    const board = deck.splice(0, 3);
    set({ confirmedHand: true, board, deck });
  },
  postflopAction: (
    street: Street,
    action: "commit" | "fold",
    result: EquityPayload,
    betAmount?: number,
  ) => {
    if (street === "flop") {
      set(() => ({ flop: action }));
    } else if (street === "turn") {
      set(() => ({ turn: action }));
    } else if (street === "river") {
      set(() => ({ river: action }));
    }

    const { stack, deck, board } = get();

    const STREET_W = { preflop: 0, flop: 0.9, turn: 1.1, river: 1.5 } as const;

    const targetBet = result.equity * 100;
    const betValue = Math.max(0, Math.min(100, betAmount ?? 0));
    const distance = Math.abs(betValue - targetBet);
    const accuracy = 1 - Math.min(distance / 100, 1);
    const deltaScore = Math.round(accuracy * 10 * STREET_W[street]);

    const newStack = stack + deltaScore;

    const newCard = deck.splice(0, 1)[0];

    if (action === "fold") {
      set(() => ({
        delta: 0,
      }));
      return;
    }

    set(() => ({
      street:
        street === "flop" ? "turn" : street === "turn" ? "river" : "river",
      stack: newStack,
      delta: deltaScore,
      ...(street === "river" ? {} : { board: [...board, newCard] }),
    }));
  },
}));

export { useActionStore };

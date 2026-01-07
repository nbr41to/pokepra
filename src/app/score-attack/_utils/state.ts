import { create } from "zustand";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { genHands, getShuffledDeck } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";
import { judgeInRange } from "@/utils/preflop-range";

const PEOPLE = 9;
const DEFAULT_TIER = 6;

type Phase = "preflop" | "flop" | "turn" | "river";
type PreflopAction = "open-raise" | "fold";

type History = {
  hand: string[];
  position: number;
  board: string[];
  preflop: PreflopAction;
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;
  equity: number;
};

type State = {
  phase: Phase; // ストリート
  stack: number; // 持ち点
  delta: number; // 前回のスコア変動

  deck: string[]; // デッキ

  position: number; // ポジション番号
  hero: string[]; // 自分のハンド
  showedHand: boolean; // ハンドを見たかどうか
  board: string[]; // ボード

  // action
  preflop: PreflopAction | null;
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;

  // history
  histories: History[];
};

type Actions = {
  reset: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  showHand: () => void;
  preflopAction: (action: PreflopAction) => void;
  postflopAction: (
    phase: Phase,
    action: "commit" | "fold",
    rank: CombinedPayload,
  ) => void;
};

type Store = State & Actions;

const hero = genHands(8);
const deck = getShuffledDeck(hero);

const INITIAL_STATE: Omit<State, "deck" | "hero"> = {
  phase: "preflop",
  stack: 100,
  delta: 0,
  position: 1,
  board: [],

  showedHand: false,
  preflop: null,
  flop: null,
  turn: null,
  river: null,

  histories: [],
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,
  hero,
  deck,

  /* Action */
  reset: () => {
    set(() => ({ ...INITIAL_STATE, hero, deck }));
  },
  shuffleAndDeal: (options?: { tier?: number; people?: number }) => {
    const tier = options?.tier ?? DEFAULT_TIER;
    const people = options?.people ?? PEOPLE;

    const { stack } = get();

    const hero = genHands(tier);
    const deck = getShuffledDeck(hero);

    console.log(hero);

    set(() => ({
      ...INITIAL_STATE,
      position: genPositionNumber(people),
      hero: hero,
      deck: deck,
      stack,
    }));
  },
  // ハンドを確認
  showHand: () => {
    set({ showedHand: true });
  },
  // プリフロップのアクション
  preflopAction: (action: PreflopAction) => {
    const { position, hero, deck, stack } = get();
    const inRange = judgeInRange(hero, position);
    const correct = action === "open-raise" ? inRange : !inRange;
    const amount = correct ? 2 : -2;

    if (action === "fold") {
      set({
        preflop: action,
        stack: stack + amount,
      });
    } else {
      const board = deck.splice(0, 3);

      set({
        preflop: action,
        stack: stack + amount,
        phase: "flop",
        deck,
        board,
        delta: amount,
      });
    }
  },
  postflopAction: (
    phase: Phase,
    action: "commit" | "fold",
    rank: CombinedPayload,
  ) => {
    if (phase === "flop") {
      set(() => ({ flop: action }));
    } else if (phase === "turn") {
      set(() => ({ turn: action }));
    } else if (phase === "river") {
      set(() => ({ river: action }));
    }

    const { stack, deck, board } = get();

    const STREET_W = { preflop: 0, flop: 0.9, turn: 1.1, river: 1.5 } as const;

    const rare =
      rank.data.findIndex((data) => data.hand === rank.hand) / rank.data.length;

    const compareEquityAveage =
      rank.data.reduce(
        (acc, cur) => acc + (cur.win + cur.tie / 2) / cur.count,
        0,
      ) / rank.data.length;
    const deltaScore = Math.floor(
      ((rank.equity - compareEquityAveage) * 10 * STREET_W[phase]) /
        (rare < 0.1 ? 0.5 : rare < 0.3 ? 0.7 : 1),
    );

    const newStack = stack + deltaScore;

    const newCard = deck.splice(0, 1)[0];

    if (action === "fold") {
      set(() => ({
        delta: deltaScore,
      }));
      return;
    }

    set(() => ({
      phase: phase === "flop" ? "turn" : phase === "turn" ? "river" : "river",
      stack: newStack,
      delta: deltaScore,
      ...(phase === "river" ? {} : { board: [...board, newCard] }),
    }));
  },
}));

export { useActionStore };

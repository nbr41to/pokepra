import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm/simulation";
import type { EquityPayload } from "@/lib/wasm/types";
import { genHand, getShuffledDeck } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";

const PEOPLE = 9;

type Street = "preflop";
type PreflopAction = "open-raise" | "fold";

type State = {
  initialized: boolean;
  finished: boolean;

  // game
  street: Street; // ストリート
  stack: number; // 持ち点
  delta: number; // 変動点数

  position: number; // ポジション番号
  hero: string[]; // ハンド
  villains: string[][]; // 他プレイヤーのハンド
  result: EquityPayload | null; // 結果一覧

  confirmedHand: boolean; // ハンドを見たかどうか

  // action
  preflop: PreflopAction | null;
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (people?: number) => Promise<void>;
  confirmHand: () => void;
  preflopAction: (action: PreflopAction) => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  street: "preflop",
  stack: 100,
  delta: 0,
  position: 0,
  hero: [],
  villains: [],
  result: null,

  confirmedHand: false,
  preflop: null,
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  reset: () => {
    set(() => ({ ...INITIAL_STATE }));
  },
  retry: () => {
    const people = PEOPLE;
    const position = genPositionNumber(people, [2]);

    const hero = genHand(0);
    const villains: string[][] = [];
    for (let i = 1; i < people - position + 1; i++) {
      const hands = genHand(0, [...hero, ...villains.flat()]);
      villains.push(hands);
    }
    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      position,
      hero,
      villains,
      preflop: null,
    }));
  },
  shuffleAndDeal: async (people = PEOPLE) => {
    const { stack } = get();
    const position = genPositionNumber(people, [2]); // BBは除外
    const afterPeople = position === 1 ? 1 : people + 2 - position;
    const deck = getShuffledDeck();

    const hero = deck.splice(0, 2);
    const villains: string[][] = [];
    for (let i = 1; i < afterPeople + 1; i++) {
      const hands = deck.splice(0, 2);
      villains.push(hands);
    }

    const result = await simulateVsListEquity({
      hero: hero,
      board: [],
      compare: villains,
      trials: 1000,
      include: { data: true },
    });

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      position,
      hero,
      villains,
      stack,
      preflop: null,
      result,
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    set(() => ({ confirmedHand: true }));
  },
  // プリフロップのアクション
  preflopAction: (action: PreflopAction) => {
    const POT = 100;

    const { stack, result } = get();
    const heroEq = result?.equity ?? 0;
    const villainsMaxEq =
      result?.data
        .filter((v) => v.hand !== result?.hand)
        .reduce((a, b) => Math.max(a, b.equity), 0) ?? 0;

    // EVの計算
    const expandValue = (heroEq - villainsMaxEq) * POT;
    const delta = Math.floor(expandValue);

    if (action === "fold") {
      set({
        preflop: action,
        delta,
        finished: true,
      });
      return;
    }

    set({
      preflop: action,
      stack: stack + delta,
      delta,
      finished: true,
    });
  },
}));

export { useActionStore };

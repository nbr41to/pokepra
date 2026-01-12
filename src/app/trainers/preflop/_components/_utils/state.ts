import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm/simulate-vs-list-equity";
import type { EquityPayload } from "@/lib/wasm/types";
import { genHands } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";

const PEOPLE = 9;

type Phase = "preflop";
type PreflopAction = "open-raise" | "fold";

type State = {
  initialized: boolean;

  // game
  phase: Phase; // ストリート
  stack: number; // 持ち点
  delta: number; // 変動点数

  position: number; // ポジション番号
  hero: string[]; // ハンド
  otherPlayersHands: string[][]; // 他プレイヤーのハンド
  result: EquityPayload | null; // 結果一覧

  showedHand: boolean; // ハンドを見たかどうか

  // action
  preflop: PreflopAction | null;
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => Promise<void>;
  showHand: () => void;
  preflopAction: (action: PreflopAction) => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  phase: "preflop",
  stack: 10,
  delta: 0,
  position: 0,
  hero: [],
  otherPlayersHands: [],
  result: null,

  showedHand: false,
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
    const position = genPositionNumber(people - 1);

    const hero = genHands(0);
    const otherPlayersHands: string[][] = [];
    for (let i = 1; i < people - position + 1; i++) {
      const hands = genHands(0, [...hero, ...otherPlayersHands.flat()]);
      otherPlayersHands.push(hands);
    }
    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      position,
      hero,
      otherPlayersHands,
      preflop: null,
    }));
  },
  shuffleAndDeal: async (options?: { tier?: number; people?: number }) => {
    const { stack } = get();
    const people = options?.people ?? PEOPLE;
    const position = genPositionNumber(people - 1);

    const hero = genHands(0);
    const otherPlayersHands: string[][] = [];
    for (let i = 1; i < people - position + 1; i++) {
      const hands = genHands(0, [...hero, ...otherPlayersHands.flat()]);
      otherPlayersHands.push(hands);
    }

    const result = await simulateVsListEquity({
      hero: hero,
      board: [],
      compare: otherPlayersHands,
      trials: 1000,
    });

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      position,
      hero,
      otherPlayersHands,
      stack,
      preflop: null,
      result,
    }));
  },
  // ハンドを確認
  showHand: () => {
    set(() => ({ showedHand: true }));
  },
  // プリフロップのアクション
  preflopAction: (action: PreflopAction) => {
    if (action === "open-raise") {
      const { stack, otherPlayersHands, result } = get();
      const otherHandEqs = otherPlayersHands.map((h) => {
        return result?.data.find((r) => r.hand === h.join(" "))?.equity ?? 0;
      });
      const lossCount = otherHandEqs.filter((eq) => eq > 0.5).length;
      const delta = lossCount === 0 ? 3 : -lossCount;
      set({
        preflop: action,
        stack: stack + delta,
        delta,
      });
    }

    set({
      preflop: action,
    });
  },
}));

export { useActionStore };

import { create } from "zustand";
import RANKING from "@/data/preflop-hand-ranking.json";
import { genHands } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";
import { getHandString } from "@/utils/preflop-range";

const PEOPLE = 9;

type Phase = "preflop";
type PreflopAction = "open-raise" | "fold";

type History = {
  hand: string[];
  position: number;
  board: string[];
  preflop: PreflopAction;
  equity: number;
};

type State = {
  state: "reception" | "confirmation"; // アクション待ち | 確認待ち

  // game
  phase: Phase; // ストリート
  stack: number; // 持ち点
  delta: number; // 変動点数

  position: number; // ポジション番号
  hero: string[]; // ハンド
  otherPlayersHands: string[][]; // 他プレイヤーのハンド
  showedHand: boolean; // ハンドを見たかどうか

  // action
  preflop: PreflopAction | null;

  // history
  histories: History[];
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  showHand: () => void;
  preflopAction: (action: PreflopAction) => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  state: "reception",
  phase: "preflop",
  stack: 10,
  delta: 0,
  position: 0,
  hero: [],
  otherPlayersHands: [],

  showedHand: false,
  preflop: null,

  histories: [],
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
      position,
      hero,
      otherPlayersHands,
      preflop: null,
    }));
  },
  shuffleAndDeal: (options?: { tier?: number; people?: number }) => {
    const { stack } = get();
    const people = options?.people ?? PEOPLE;
    const position = genPositionNumber(people - 1);

    const hero = genHands(0);
    const otherPlayersHands: string[][] = [];
    for (let i = 1; i < people - position + 1; i++) {
      const hands = genHands(0, [...hero, ...otherPlayersHands.flat()]);
      otherPlayersHands.push(hands);
    }

    set(() => ({
      ...INITIAL_STATE,
      position,
      hero,
      otherPlayersHands,
      stack,
      preflop: null,
    }));
  },
  // ハンドを確認
  showHand: () => {
    set(() => ({ showedHand: true }));
  },
  // プリフロップのアクション
  preflopAction: (action: PreflopAction) => {
    if (action === "open-raise") {
      const { hero, stack, otherPlayersHands } = get();
      const heroEq =
        RANKING.find((r) => r.hand === getHandString(hero))?.player6 ?? 0;
      const otherHandEqs = otherPlayersHands.map((h) => {
        return RANKING.find((r) => r.hand === getHandString(h))?.player6 ?? 0;
      });
      const lossCount = otherHandEqs.filter((eq) => eq > heroEq).length;
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

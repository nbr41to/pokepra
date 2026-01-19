import { create } from "zustand";
import { parseRangeToHands } from "@/lib/wasm/simulation";
import { genHand } from "@/utils/dealer";
import { getRangeStrengthByPosition } from "@/utils/hand-range";
import { genPositionNumber } from "@/utils/position";
import { getSettingOpenRange } from "@/utils/setting";

const PEOPLE = 9;

type State = {
  initialized: boolean;
  finished: boolean;

  settings: {
    people: number;
    lockedPosition: boolean;
  };

  // game
  stack: number; // 持ち点
  delta: number; // 変動点数

  position: number; // ポジション番号
  hero: string[]; // ハンド

  confirmedHand: boolean; // ハンドを見たかどうか
  correctRange: string[][]; // 正しいレンジ
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (people?: number) => Promise<void>;
  confirmHand: () => void;
  toggleLockPosition: () => void;
  open: () => void;
  fold: () => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  settings: {
    people: PEOPLE,
    lockedPosition: false,
  },
  stack: 100,
  delta: 0,
  position: 0,
  hero: [],
  correctRange: [],

  confirmedHand: false,
};

const useTrainerStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  reset: () => {
    set(() => ({ ...INITIAL_STATE }));
  },
  retry: () => {
    const people = PEOPLE;
    const position = genPositionNumber(people, [1, 2]);

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
    const { initialized, position, stack, settings } = get();
    let newPosition = position;
    if (!initialized) {
      newPosition = genPositionNumber(people, [1, 2]);
    } else if (!settings.lockedPosition) {
      newPosition = position === people ? 3 : position + 1;
    }
    const hero = genHand(0);

    const ranges = getSettingOpenRange();
    const range = ranges[getRangeStrengthByPosition(newPosition, 9) - 1];
    const correctRange = await parseRangeToHands({ range });

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      position: newPosition,
      hero,
      stack,
      preflop: null,
      settings,
      correctRange,
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    set(() => ({ confirmedHand: true }));
  },
  // ポジションを固定
  toggleLockPosition: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        lockedPosition: !state.settings.lockedPosition,
      },
    }));
  },
  // Open Raise
  open: async () => {
    const { position, stack, hero } = get();
    const ranges = getSettingOpenRange();
    const rangeCombos = await parseRangeToHands({
      range: ranges[getRangeStrengthByPosition(position, PEOPLE)],
    });

    const includeRange = rangeCombos.some(
      (hand) => hand[0] === hero[0] && hand[1] === hero[1],
    );

    set(() => ({
      finished: true,
      delta: includeRange ? Math.ceil(stack * 0.1) : -Math.ceil(stack * 0.1),
    }));
  },
  // Fold
  fold: async () => {
    const { position, stack, hero } = get();
    const ranges = getSettingOpenRange();
    const rangeCombos = await parseRangeToHands({
      range: ranges[getRangeStrengthByPosition(position, PEOPLE)],
    });
    const includeRange = rangeCombos.some(
      (hand) => hand[0] === hero[0] && hand[1] === hero[1],
    );

    set(() => ({
      finished: true,
      delta: includeRange ? -Math.ceil(stack * 0.05) : Math.ceil(stack * 0.05),
    }));
  },
}));

export { useTrainerStore };

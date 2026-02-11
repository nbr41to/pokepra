import { create } from "zustand";
import type { MultiHandEquityPayload } from "@/lib/wasm-v1/simulation";
import { simulateMultiHandEquity } from "@/lib/wasm-v1/simulation";
import { genHand } from "@/utils/dealer";
import { genRandomInt } from "@/utils/general";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";

const PEOPLE = 9;
const SB = 0.5;
const BB = 1;
const BB_ANTE = 1;
const RAKE = 0.05;
const MIN_OPEN_RAISE = 2;
const MAX_OPEN_RAISE = 10;
const OPEN_RAISE_STEP = 0.5;
const MIN_OPPONENTS = 1;

type PreflopAction = "call" | "fold";

type State = {
  initialized: boolean;
  confirmedHand: boolean; // ハンドを見たかどうか
  hiddenRequiredEquity: boolean;

  delta: number; // 変動点数
  stack: number; // 持ち点

  villainPosition: number; // 相手のポジション番号
  hero: string[]; // ハンド
  openRaise: number; // 相手のオープンレイズ額(BB)
  opponentsCount: number; // 相手人数
  multiEnabled: boolean; // マルチウェイ
  callAmount: number; // コールに必要な追加額
  pot: number; // コール後ポット
  rakeAmount: number; // レーキ
  requiredEquity: number; // 必要勝率

  action: PreflopAction | null;

  heroEquity: number;
  results: MultiHandEquityPayload[];
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => Promise<void>;
  confirmHand: () => void;
  toggleHiddenRequiredEquity: () => void;
  calcResult: (action: PreflopAction) => void;
  toggleMulti: () => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  confirmedHand: false,
  hiddenRequiredEquity: false,

  delta: 0,
  stack: 50,
  villainPosition: 0,
  hero: [],
  openRaise: 0,
  opponentsCount: MIN_OPPONENTS,
  multiEnabled: false,
  callAmount: 0,
  pot: 0,
  rakeAmount: 0,
  requiredEquity: 0,
  action: null,
  heroEquity: 0,
  results: [],
};

const getRandomOpenRaise = () => {
  const steps =
    Math.round((MAX_OPEN_RAISE - MIN_OPEN_RAISE) / OPEN_RAISE_STEP) + 1;
  return MIN_OPEN_RAISE + genRandomInt(steps) * OPEN_RAISE_STEP;
};

const getRandomOpponentsCount = () => {
  const roll = genRandomInt(10);
  if (roll < 5) return 1;
  if (roll < 8) return 2;
  return 3;
};

const handsOverlap = (a: string[], b: string[]) =>
  a.some((card) => b.includes(card));

const pickOpponents = (candidates: string[][], count: number) => {
  const pool = candidates.slice();
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = genRandomInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected: string[][] = [];
  for (const hand of pool) {
    if (selected.length >= count) break;
    if (selected.some((picked) => handsOverlap(hand, picked))) continue;
    selected.push(hand);
  }

  if (selected.length < count) {
    throw new Error("Not enough non-overlapping opponents");
  }

  return selected;
};

const calcPreflopMeta = (
  openRaise: number,
  opponentsCount: number,
  raiserPosition: number,
) => {
  const callAmount = Math.max(openRaise - BB, 0);
  const includeSB =
    raiserPosition === 1 ||
    (raiserPosition === 9 && opponentsCount === 2) ||
    (raiserPosition === 6 && opponentsCount === 3);
  const potBeforeCall =
    SB + BB + BB_ANTE + openRaise * opponentsCount - (includeSB ? SB : 0);
  const pot = potBeforeCall + callAmount;
  const rakeAmount = pot * RAKE;
  const effectivePot = pot - rakeAmount;
  const requiredEquity = effectivePot > 0 ? callAmount / effectivePot : 1;

  return { callAmount, pot, rakeAmount, requiredEquity };
};

const getOpponentsCapacity = (
  position: number,
  total: number,
  bbPosition = 2,
) => {
  if (position === bbPosition) return 0;
  let count = 0;
  let current = position;
  while (current !== bbPosition) {
    count += 1;
    current = (current % total) + 1;
  }
  return count;
};

const getVillainPosition = (people: number, opponentsCount: number) => {
  const candidates = Array.from({ length: people }, (_, index) => index + 1)
    .filter((position) => position !== 2)
    .filter(
      (position) => getOpponentsCapacity(position, people) >= opponentsCount,
    );

  if (candidates.length === 0) {
    throw new Error("No valid villain positions for opponentsCount");
  }

  return candidates[genRandomInt(candidates.length)];
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  reset: () => {
    set(() => ({ ...INITIAL_STATE }));
  },
  toggleMulti: () => {
    set((state) => ({ multiEnabled: !state.multiEnabled }));
  },
  retry: () => {
    const people = PEOPLE;
    const openRaise = getRandomOpenRaise();
    const { multiEnabled } = get();
    const opponentsCount = multiEnabled ? getRandomOpponentsCount() : 1;
    const villainPosition = getVillainPosition(people, opponentsCount);
    const hero = genHand();
    const { callAmount, pot, rakeAmount, requiredEquity } = calcPreflopMeta(
      openRaise,
      opponentsCount,
      villainPosition,
    );

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      hero,
      villainPosition,
      openRaise,
      opponentsCount,
      multiEnabled,
      callAmount,
      pot,
      rakeAmount,
      requiredEquity,
      action: null,
    }));
  },

  shuffleAndDeal: async (_options?: { tier?: number; people?: number }) => {
    const { stack } = get();
    const people = PEOPLE;
    const openRaise = getRandomOpenRaise();
    const { multiEnabled } = get();
    const opponentsCount = multiEnabled ? getRandomOpponentsCount() : 1;
    const villainPosition = getVillainPosition(people, opponentsCount);
    const hero = genHand();
    const { callAmount, pot, rakeAmount, requiredEquity } = calcPreflopMeta(
      openRaise,
      opponentsCount,
      villainPosition,
    );

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      delta: -(BB + BB_ANTE),
      stack: stack - BB - BB_ANTE,
      hero,
      villainPosition,
      openRaise,
      opponentsCount,
      multiEnabled,
      callAmount,
      pot,
      rakeAmount,
      requiredEquity,
      action: null,
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    set(() => ({ confirmedHand: true }));
  },
  // 必要勝率の表示切替
  toggleHiddenRequiredEquity: () => {
    const { hiddenRequiredEquity } = get();
    set({ hiddenRequiredEquity: !hiddenRequiredEquity });
  },

  // アクション時の計算
  calcResult: async (action: PreflopAction) => {
    const {
      villainPosition,
      hero,
      stack,
      opponentsCount,
      pot,
      callAmount,
      rakeAmount,
    } = get();

    const compareCandidates = getHandsByStrength(
      getRangeStrengthByPosition(villainPosition),
      hero,
    );

    const results = await Promise.all(
      Array.from({ length: 200 }, async () => {
        const opponents = pickOpponents(compareCandidates, opponentsCount);
        const result = await simulateMultiHandEquity({
          hands: [hero, ...opponents],
          board: [],
          trials: 100,
        });

        return result;
      }),
    );

    // 平均を取る
    const heroKey = hero.join(" ");
    const heroEquity =
      results.reduce(
        (acc, result) =>
          acc +
          (result.data.find((entry) => entry.hand === heroKey)?.equity ?? 0),
        0,
      ) / results.length;

    if (action === "fold") {
      set({
        delta: 0,
        action,
        results,
        heroEquity,
      });
    }

    if (action === "call") {
      const expectedValue = (pot - rakeAmount) * heroEquity - callAmount;
      const delta = Math.round(expectedValue);

      set({
        delta,
        stack: stack + delta,
        action,
        results,
        heroEquity,
      });
    }
  },
}));

export { useActionStore };

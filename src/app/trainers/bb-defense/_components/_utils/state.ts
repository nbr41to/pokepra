import { create } from "zustand";
import type { MultiHandEquityPayload } from "@/lib/wasm/simulation";
import { simulateMultiHandEquity } from "@/lib/wasm/simulation";
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
const MAX_OPEN_RAISE = 5;
const OPEN_RAISE_STEP = 0.5;
const MIN_OPPONENTS = 1;

type PreflopAction = "call" | "fold";

type State = {
  initialized: boolean;
  confirmedHand: boolean; // ハンドを見たかどうか

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

  result: MultiHandEquityPayload | null;
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => Promise<void>;
  confirmHand: () => void;
  calcResult: (action: PreflopAction) => void;
  toggleMulti: () => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
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
  confirmedHand: false,
  action: null,
  result: null,
};

const getRandomOpenRaise = () => {
  const steps =
    Math.round((MAX_OPEN_RAISE - MIN_OPEN_RAISE) / OPEN_RAISE_STEP) + 1;
  return MIN_OPEN_RAISE + genRandomInt(steps) * OPEN_RAISE_STEP;
};

const getRandomOpponentsCount = () => {
  const roll = genRandomInt(10);
  if (roll < 6) return 1;
  if (roll < 9) return 2;
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
  const playersCount = opponentsCount + 1;
  const raiserIsSb = raiserPosition === 1;
  const potBeforeCall =
    SB +
    BB +
    BB_ANTE * playersCount +
    openRaise * opponentsCount -
    (raiserIsSb ? SB : 0);
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
      stack,
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

  // アクション時の計算
  calcResult: async (action: PreflopAction) => {
    const {
      villainPosition,
      hero,
      stack,
      opponentsCount,
      callAmount,
      pot,
      rakeAmount,
      requiredEquity,
    } = get();

    const compareCandidates = getHandsByStrength(
      getRangeStrengthByPosition(villainPosition),
      hero,
    );
    const opponents = pickOpponents(compareCandidates, opponentsCount);
    const result = await simulateMultiHandEquity({
      hands: [hero, ...opponents],
      board: [],
      trials: 1000,
    });
    const heroKey = hero.join(" ");
    const heroEquity =
      result.data.find((entry) => entry.hand === heroKey)?.equity ?? 0;

    const winDelta = pot - rakeAmount - (BB + BB_ANTE + callAmount);
    const loseDelta = -(BB + BB_ANTE + callAmount);
    const rawDelta = heroEquity >= requiredEquity ? winDelta : loseDelta;
    const delta = Math.floor(rawDelta);

    if (action === "call") {
      set({
        delta,
        stack: stack + delta,
        action,
        result,
      });
    }
    if (action === "fold") {
      set({
        delta: -(BB + BB_ANTE),
        stack: stack - (BB + BB_ANTE),
        action,
        result,
      });
    }
  },
}));

export { useActionStore };

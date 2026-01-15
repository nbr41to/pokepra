import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm/simulate-vs-list-equity";
import type { EquityPayload } from "@/lib/wasm/simulation";
import { genHands } from "@/utils/dealer";
import { genRandomInt } from "@/utils/general";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";
import { genPositionNumber } from "@/utils/position";

const PEOPLE = 9;
const SB = 0.5;
const BB = 1;
const BB_ANTE = 1;
const RAKE = 0.05;
const MIN_OPEN_RAISE = 2;
const MAX_OPEN_RAISE = 8;
const OPEN_RAISE_STEP = 0.5;

type PreflopAction = "call" | "fold";

type State = {
  initialized: boolean;
  showedHand: boolean; // ハンドを見たかどうか

  delta: number; // 変動点数
  stack: number; // 持ち点

  villainPosition: number; // 相手のポジション番号
  hero: string[]; // ハンド
  openRaise: number; // 相手のオープンレイズ額(BB)
  callAmount: number; // コールに必要な追加額
  pot: number; // コール後ポット
  rakeAmount: number; // レーキ
  requiredEquity: number; // 必要勝率

  action: PreflopAction | null;

  result: EquityPayload | null;
};

type Actions = {
  reset: () => void;
  retry: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => Promise<void>;
  showHand: () => void;
  calcResult: (action: PreflopAction) => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  initialized: false,
  delta: 0,
  stack: 50,
  villainPosition: 0,
  hero: [],
  openRaise: 0,
  callAmount: 0,
  pot: 0,
  rakeAmount: 0,
  requiredEquity: 0,
  showedHand: false,
  action: null,
  result: null,
};

const getRandomOpenRaise = () => {
  const steps =
    Math.round((MAX_OPEN_RAISE - MIN_OPEN_RAISE) / OPEN_RAISE_STEP) + 1;
  return MIN_OPEN_RAISE + genRandomInt(steps) * OPEN_RAISE_STEP;
};

const calcPreflopMeta = (openRaise: number) => {
  const callAmount = Math.max(openRaise - BB, 0);
  const potBeforeCall = SB + BB + BB_ANTE + openRaise;
  const pot = potBeforeCall + callAmount;
  const rakeAmount = pot * RAKE;
  const effectivePot = pot - rakeAmount;
  const requiredEquity = effectivePot > 0 ? callAmount / effectivePot : 1;

  return { callAmount, pot, rakeAmount, requiredEquity };
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
    const villainPosition = genPositionNumber(people, [2]);
    const hero = genHands(0);
    const openRaise = getRandomOpenRaise();
    const { callAmount, pot, rakeAmount, requiredEquity } =
      calcPreflopMeta(openRaise);

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      hero,
      villainPosition,
      openRaise,
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
    const villainPosition = genPositionNumber(people, [2]);
    const hero = genHands(0);
    const openRaise = getRandomOpenRaise();
    const { callAmount, pot, rakeAmount, requiredEquity } =
      calcPreflopMeta(openRaise);

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      stack,
      hero,
      villainPosition,
      openRaise,
      callAmount,
      pot,
      rakeAmount,
      requiredEquity,
      action: null,
    }));
  },
  // ハンドを確認
  showHand: () => {
    set(() => ({ showedHand: true }));
  },

  // アクション時の計算
  calcResult: async (action: PreflopAction) => {
    const {
      villainPosition,
      hero,
      stack,
      callAmount,
      pot,
      rakeAmount,
      requiredEquity,
    } = get();

    const result = await simulateVsListEquity({
      hero: hero,
      board: [],
      compare: getHandsInRange(
        getRangeStrengthByPosition(villainPosition),
        hero,
      ),
      trials: 1000,
    });

    const winDelta = pot - rakeAmount - (BB + BB_ANTE + callAmount);
    const loseDelta = -(BB + BB_ANTE + callAmount);
    const rawDelta = result.equity >= requiredEquity ? winDelta : loseDelta;
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

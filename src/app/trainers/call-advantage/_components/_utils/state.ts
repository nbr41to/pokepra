import { create } from "zustand";
import { simulateVsListEquity } from "@/lib/wasm/simulation";
import { genHand, getShuffledDeck } from "@/utils/dealer";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";
import { genPositionNumber } from "@/utils/position";

const PEOPLE = 9;
const DEFAULT_TIER = 6;
const BET_SIZE_RATES = [0.33, 0.5, 0.66, 0.75, 1.0, 1.2, 1.5, 2.0];

type Street = "flop" | "turn" | "river";
type State = {
  initialized: boolean;
  finished: boolean;
  confirmedHand: boolean; // ハンドを見たかどうか

  street: Street; // ストリート
  stack: number; // 持ち点
  delta: number; // 前回のスコア変動

  deck: string[]; // デッキ

  hero: string[]; // 自分のハンド
  heroEquity: number;
  villainPosition: number;
  villain: string[];
  board: string[]; // ボード

  pot: number;
  bet: number;

  // action
  flop: "call" | "fold" | null;
  turn: "call" | "fold" | null;
  river: "call" | "fold" | null;
};

type Actions = {
  clear: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  confirmHand: () => void;
  heroAction: (action: "call" | "fold") => void;
};

type Store = State & Actions;

const ROUND = ["flop", "turn", "river"] as const;
const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  confirmedHand: false,

  street: "flop",
  stack: 100,
  delta: 0,
  deck: [],
  hero: [],
  heroEquity: 0,
  villain: [],
  villainPosition: 0,
  board: [],
  pot: 20,
  bet: 0,

  flop: null,
  turn: null,
  river: null,
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */

  shuffleAndDeal: async (options?: { strength?: number; people?: number }) => {
    const tier = options?.strength ?? DEFAULT_TIER;

    const { stack } = get();

    const hero = genHand(tier);
    const villainPosition = genPositionNumber(options?.people ?? PEOPLE, []);
    const deck = getShuffledDeck([...hero]);
    const board = deck.splice(0, 3);

    console.log(board);
    const equityPayload = await simulateEquity({
      hero,
      villainPosition,
      board,
    });
    console.log(equityPayload);
    const betSize = pickBetSize({
      pot: INITIAL_STATE.pot,
      equity: equityPayload.equity,
    });

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      stack,
      deck,
      hero: hero,
      heroEquity: equityPayload.equity,
      villainPosition,
      board,
      bet: betSize,
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    set({ confirmedHand: true });
  },
  heroAction: async (action: "call" | "fold") => {
    const {
      street,
      stack,
      deck,
      board,
      pot,
      bet,
      heroEquity,
      hero,
      villainPosition,
    } = get();

    if (street !== "river") {
      set({ street: ROUND[ROUND.indexOf(street) + 1] });
    }

    // 必要勝率の計算
    const requiredEquity = bet / (pot + bet);
    const delta = heroEquity - requiredEquity;

    if (action === "fold") {
      set(() => ({
        delta,
        finished: true,
      }));

      return;
    }

    // river
    if (street === "river") {
      set(() => ({
        delta,
        finished: true,
      }));

      return;
    }

    // flop or turn
    const newBoard = [...board];
    newBoard.push(...deck.splice(0, 1));
    const { equity } = await simulateEquity({
      hero,
      villainPosition,
      board: newBoard,
    });

    const newPot = pot + bet;
    const betSize = pickBetSize({
      pot: newPot,
      equity,
    });

    set(() => ({
      heroEquity: equity,
      stack: stack - bet,
      bet: betSize,
      pot: pot + bet,
      delta,
      board: newBoard,
    }));
  },
  clear: () => {
    set(INITIAL_STATE);
  },
}));

const simulateEquity = async ({
  hero,
  villainPosition,
  board,
}: {
  hero: string[];
  villainPosition: number;
  board: string[];
}) => {
  return simulateVsListEquity({
    hero,
    board,
    compare: getHandsByStrength(getRangeStrengthByPosition(villainPosition), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });
};

const pickBetRate = (equity: number) => {
  const requiredRates = BET_SIZE_RATES.map((rate) => rate / (1 + rate));
  const closestIndex = requiredRates.reduce((bestIndex, required, index) => {
    const bestDiff = Math.abs(requiredRates[bestIndex] - equity);
    const diff = Math.abs(required - equity);
    return diff < bestDiff ? index : bestIndex;
  }, 0);

  const candidates = [closestIndex - 1, closestIndex + 1].filter(
    (index) => index >= 0 && index < BET_SIZE_RATES.length,
  );

  if (candidates.length === 0) return BET_SIZE_RATES[closestIndex];
  if (candidates.length === 1) return BET_SIZE_RATES[candidates[0]];

  const lowerIndex = Math.min(...candidates);
  const higherIndex = Math.max(...candidates);
  return Math.random() < 0.35 // 35%の確率で大きめのベットを選ぶように
    ? BET_SIZE_RATES[higherIndex]
    : BET_SIZE_RATES[lowerIndex];
};

const pickBetSize = ({ pot, equity }: { pot: number; equity: number }) =>
  pot * pickBetRate(equity);

export { useActionStore };

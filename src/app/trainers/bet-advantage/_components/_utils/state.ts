import { create } from "zustand";
import {
  parseRangeToHands,
  type RangeVsRangePayload,
  simulateRangeVsRangeEquity,
  simulateVsListEquity,
} from "@/lib/wasm/simulation";
import { genHand, getShuffledDeck } from "@/utils/dealer";
import { getRangeStrengthByPosition } from "@/utils/hand-range";
import { genPositionNumber } from "@/utils/position";
import { getSettingOpenRange } from "@/utils/setting";
import { calcExpectedValue } from "./calc";

const PEOPLE = 9;
const DEFAULT_STRENGTH = 6;
const BET_SIZE_RATES = [0.33, 0.5, 0.67, 1.0, 1.25, 1.5, 2.0, 3.0];

type Street = "flop" | "turn" | "river";
type BetActionLabelType = "size" | "equity";
type State = {
  initialized: boolean;
  finished: boolean;
  confirmedHand: boolean; // ハンドを見たかどうか
  betActionLabelType: BetActionLabelType;

  street: Street; // ストリート
  stack: number; // 持ち点
  delta: number; // 前回のスコア変動

  deck: string[]; // デッキ

  hero: string[]; // 自分のハンド
  position: number;
  villain: string[];
  continueVillainRange: string[][]; // 相手の継続レンジ
  board: string[]; // ボード

  pot: number;

  // action
  flop: "call" | "fold" | null;
  turn: "call" | "fold" | null;
  river: "call" | "fold" | null;

  results: number[];
  // payloads
  rangePromises: Promise<RangeVsRangePayload>[];
};

type Actions = {
  clear: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => Promise<void>;
  confirmHand: () => void;
  toggleBetActionLabelType: () => void;
  heroAction: (
    action: (typeof BET_SIZE_RATES)[number] | "fold",
  ) => Promise<void>;
};

type Store = State & Actions;

const ROUND = ["flop", "turn", "river"] as const;
const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  confirmedHand: false,
  betActionLabelType: "size",

  street: "flop",
  stack: 10,
  delta: 0,
  deck: [],
  hero: [],
  villain: [],
  continueVillainRange: [],
  position: 0,
  board: [],
  pot: 10,

  flop: null,
  turn: null,
  river: null,

  results: [],
  rangePromises: [],
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  shuffleAndDeal: async (options?: { strength?: number; people?: number }) => {
    const strength = options?.strength ?? DEFAULT_STRENGTH;

    const { stack } = get();
    const hero = genHand(strength);
    const position = genPositionNumber(options?.people ?? PEOPLE, [1, 2]); // SB, BBを除く
    const deck = getShuffledDeck([...hero]);
    const board = deck.splice(0, 3);

    const configRanges = getSettingOpenRange();

    const rangePromise = simulateRangeEquity({
      heroRange: configRanges[getRangeStrengthByPosition(position)],
      villainRange: configRanges[2], // BB 想定
      board,
    });
    const continueVillainRange = await parseRangeToHands({
      range: configRanges[2],
      excludedCards: [...hero, ...board],
    });

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      stack,
      deck,
      hero,
      position,
      board,
      continueVillainRange,
      rangePromises: [rangePromise],
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    set({ confirmedHand: true });
  },
  toggleBetActionLabelType: () => {
    const { betActionLabelType } = get();
    set({
      betActionLabelType: betActionLabelType === "size" ? "equity" : "size",
    });
  },
  // ヒーローのアクション
  heroAction: async (action) => {
    const { street, stack, deck, board, pot, hero, position, rangePromises } =
      get();

    if (street !== "river") {
      set({ street: ROUND[ROUND.indexOf(street) + 1] });
    }

    const promiseIndex = ROUND.indexOf(street);
    const rangePayload = await rangePromises[promiseIndex];
    const villainHands = rangePayload.villain.filter(
      (r) => !r.hand.split(" ").find((r) => [...hero, ...board].includes(r)),
    ); // hero と board に被らないハンドのみ

    const betPatterns = BET_SIZE_RATES.map((rate) => pot * rate);

    // 相手に突きつける必要勝率
    const requiredEquities = betPatterns.map((betSize) => {
      return betSize / (pot + betSize * 2);
    });

    const continueVillainRanges = requiredEquities.map((reqEq) => {
      const continueHands = villainHands.filter((r) => r.equity >= reqEq);

      return continueHands.map((r) => r.hand.split(" "));
    });

    const results = await Promise.all([
      ...continueVillainRanges.map(async (range, index) => {
        const { equity: continueHeroEquity } = await simulateVsListEquity({
          hero,
          board,
          compare: range,
          trials: 1000,
        });
        const foldEquity =
          (villainHands.length - range.length) / villainHands.length;

        return calcExpectedValue({
          pot,
          fe: foldEquity,
          ce: continueHeroEquity,
          bet: betPatterns[index],
        });
      }),
    ]);

    if (action === "fold") {
      set(() => ({
        finished: true,
        results,
      }));

      return;
    }

    const actionIndex = BET_SIZE_RATES.indexOf(action);
    const delta = Math.floor(results[actionIndex]);

    // river
    if (street === "river") {
      set(() => ({
        finished: true,
        delta,
      }));

      return;
    }

    // flop or turnの次のストリートの準備
    const newBoard = [...board];
    newBoard.push(...deck.splice(0, 1));
    const bet = Math.floor(pot * BET_SIZE_RATES[actionIndex]);
    const newContinueVillainRange = continueVillainRanges[actionIndex].filter(
      (r) =>
        !r.find((card) => card.split(" ").find((c) => newBoard.includes(c))),
    ); // ボードに被らないハンドのみ

    const configRanges = getSettingOpenRange();
    const newRangePromise = simulateRangeEquity({
      heroRange: configRanges[getRangeStrengthByPosition(position)],
      villainRange: newContinueVillainRange,
      board: newBoard,
    });

    set(() => ({
      stack: stack + delta,
      pot: pot + bet * 2,
      board: newBoard,
      deck,
      delta,
      results,
      continueVillainRange: newContinueVillainRange,
      rangePromises: [...rangePromises, newRangePromise],
    }));
  },
  clear: () => {
    set(INITIAL_STATE);
  },
}));

// range equity
const simulateRangeEquity = async ({
  heroRange,
  villainRange,
  board,
}: {
  heroRange: string | string[][];
  villainRange: string | string[][];
  board: string[];
}) => {
  return simulateRangeVsRangeEquity({
    heroRange,
    villainRange,
    board,
    trials: 100,
  });
};

export { BET_SIZE_RATES, useActionStore };

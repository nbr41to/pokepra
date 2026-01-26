import { create } from "zustand";
import {
  type RangeVsRangePayload,
  simulateRangeVsRangeEquity,
  simulateVsListEquity,
} from "@/lib/wasm/simulation";
import { genHand, getShuffledDeck } from "@/utils/dealer";
import { getRangeStrengthByPosition, toHandSymbol } from "@/utils/hand-range";
import { genPositionNumber } from "@/utils/position";
import { getSettingOpenRange } from "@/utils/setting";

const PEOPLE = 9;
const DEFAULT_STRENGTH = 6;

type Street = "flop" | "turn" | "river";
type State = {
  initialized: boolean;
  finished: boolean;
  confirmedHand: boolean; // ハンドを見たかどうか
  equityHidden: boolean; // 勝率を隠すかどうか

  street: Street; // ストリート
  stack: number; // 持ち点
  delta: number; // 前回のスコア変動

  deck: string[]; // デッキ

  hero: string[]; // 自分のハンド
  position: number;
  villain: string[];
  continueVillainRange: string[]; // 相手の継続レンジ
  board: string[]; // ボード

  pot: number;

  // action
  flop: "call" | "fold" | null;
  turn: "call" | "fold" | null;
  river: "call" | "fold" | null;

  // payloads
  rangePromises: Promise<RangeVsRangePayload>[];
};

type Actions = {
  clear: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  confirmHand: () => void;
  toggleEquityHidden: () => void;
  heroAction: (action: number | "fold") => void;
};

type Store = State & Actions;

const ROUND = ["flop", "turn", "river"] as const;
const INITIAL_STATE: State = {
  initialized: false,
  finished: false,
  confirmedHand: false,
  equityHidden: true,

  street: "flop",
  stack: 100,
  delta: 0,
  deck: [],
  hero: [],
  villain: [],
  continueVillainRange: [],
  position: 0,
  board: [],
  pot: 20,

  flop: null,
  turn: null,
  river: null,

  rangePromises: [],
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  shuffleAndDeal: async (options?: { strength?: number; people?: number }) => {
    const strength = options?.strength ?? DEFAULT_STRENGTH;

    const { stack, equityHidden } = get();
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

    set(() => ({
      ...INITIAL_STATE,
      initialized: true,
      equityHidden,
      stack,
      deck,
      hero,
      position,
      board,
      rangePromises: [rangePromise],
    }));
  },
  // ハンドを確認
  confirmHand: () => {
    set({ confirmedHand: true });
  },
  // 勝率の表示/非表示切り替え
  toggleEquityHidden: () => {
    set((state) => ({ equityHidden: !state.equityHidden }));
  },
  heroAction: async (action) => {
    const { street, stack, deck, board, pot, hero, position, rangePromises } =
      get();

    if (street !== "river") {
      set({ street: ROUND[ROUND.indexOf(street) + 1] });
    }

    if (action === "fold") {
      set(() => ({
        finished: true,
      }));

      return;
    }

    const promiseIndex = ROUND.indexOf(street);
    const rangePayload = await rangePromises[promiseIndex];

    const bet = 10;

    // 相手に突きつける必要勝率
    const requiredEquity = bet / (pot + bet * 2);

    const continueVillainHands = rangePayload.villain.filter(
      (r) => r.equity >= requiredEquity,
    );
    // 狭まった相手のレンジ
    const continueVillainRange = new Set(
      continueVillainHands.map((r) => toHandSymbol(r.hand)),
    );
    // フォールドエクイティ（フォールドする確率）
    const foldEquity =
      (rangePayload.villain.length - continueVillainHands.length) /
      rangePayload.villain.length;

    // 継続した場合の自分のエクイティ
    const continueHeroEquityPayload = await simulateVsListEquity({
      hero,
      board,
      compare: continueVillainHands
        .filter(
          (r) =>
            !r.hand.split(" ").find((r) => [...hero, ...board].includes(r)),
        ) // 前からやる？
        .map((r) => r.hand.split(" ")),
      trials: 1000,
    });

    const expectedValue =
      pot * foldEquity +
      (1 - foldEquity) * continueHeroEquityPayload.equity * (pot + bet * 2) -
      bet; // continueVillainRangeとのEQが必要

    console.log(continueHeroEquityPayload);
    console.log(expectedValue);

    // river
    if (street === "river") {
      set(() => ({
        finished: true,
        delta: expectedValue,
      }));

      return;
    }

    // flop or turnの次のストリートの準備
    const newBoard = [...board];
    newBoard.push(...deck.splice(0, 1));
    const configRanges = getSettingOpenRange();

    const rangePromise = simulateRangeEquity({
      heroRange: configRanges[getRangeStrengthByPosition(position)],
      villainRange: Array.from(continueVillainRange).join(","),
      board: newBoard,
    });

    set(() => ({
      stack: stack - bet,
      pot: pot + bet * 2,
      board: newBoard,
      deck,
      delta: expectedValue,
      rangePromises: [...rangePromises, rangePromise],
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
  heroRange: string;
  villainRange: string;
  board: string[];
}) => {
  return simulateRangeVsRangeEquity({
    heroRange,
    villainRange,
    board,
    trials: 100,
  });
};

export { useActionStore };

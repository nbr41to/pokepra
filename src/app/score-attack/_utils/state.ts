import { create } from "zustand";
import { genBoard, genHands } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";
import { judgeInRange } from "@/utils/preflop-range";

const PEOPLE = 9;
const DEFAULT_TIER = 6;

type Phase = "preflop" | "flop" | "turn" | "river";
type PreflopAction = "open-raise" | "fold";

type History = {
  hand: string[];
  position: number;
  board: string[];
  preflop: PreflopAction;
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;
  equity: number;
};

type State = {
  state: "reception" | "confirmation"; // アクション待ち | 確認待ち

  // game
  phase: Phase; // ストリート
  stack: number; // 持ち点
  score: number; // 前回のスコア変動

  position: number; // ポジション番号
  hand: string[]; // ハンド
  showedHand: boolean; // ハンドを見たかどうか
  board: string[]; // ボード

  // action
  preflop: PreflopAction | null;
  flop: "commit" | "fold" | null;
  turn: "commit" | "fold" | null;
  river: "commit" | "fold" | null;

  // history
  histories: History[];
};

type Actions = {
  reset: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  showHand: () => void;
  preflopAction: (action: PreflopAction) => void;
  postflopAction: (
    phase: Phase,
    action: "commit" | "fold",
    equity: number,
  ) => void;
  switchNextPhase: () => void;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  state: "reception",
  phase: "preflop",
  stack: 100,
  score: 0,
  position: 0,
  hand: [],
  board: [],

  showedHand: false,
  preflop: null,
  flop: null,
  turn: null,
  river: null,

  histories: [],
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  ...INITIAL_STATE,

  /* Action */
  reset: () => {
    set(() => ({ ...INITIAL_STATE }));
  },
  shuffleAndDeal: (options?: { tier?: number; people?: number }) => {
    const tier = options?.tier ?? DEFAULT_TIER;
    const people = options?.people ?? PEOPLE;

    const hand = genHands(tier);
    set(() => ({
      ...INITIAL_STATE,
      position: genPositionNumber(people),
      hand,
      // INITIAL_STATE をベースにしているが、stack は維持したいので上書きせず流用
      stack: get().stack,
    }));
  },
  // ハンドを確認
  showHand: () => {
    set(() => ({ showedHand: true }));
  },
  // プリフロップのアクション
  preflopAction: (action: PreflopAction) => {
    const { position, hand, stack } = get();
    const inRange = judgeInRange(hand, position);
    const correct = action === "open-raise" ? inRange : !inRange;
    const amount = correct ? 2 : -2;

    if (action === "fold") {
      set({
        preflop: action,
        stack: stack + amount,
      });
    } else {
      const board = genBoard(3, hand);
      set(() => ({ phase: "flop", board, score: 0 }));

      set({
        preflop: action,
        stack: stack + amount,
        phase: "flop",
        board,
      });
    }
  },
  postflopAction: (phase: Phase, action: "commit" | "fold", equity: number) => {
    if (phase === "flop") {
      set(() => ({ flop: action }));
    } else if (phase === "turn") {
      set(() => ({ turn: action }));
    } else if (phase === "river") {
      set(() => ({ river: action }));
    }

    const { stack, hand, board } = get();
    const M = 100; // 倍率
    const BASE_LINE = 0.5; // 基準点
    const deltaScore = Math.floor((equity - BASE_LINE) * M);
    const newStack = stack + deltaScore;

    if (action === "commit") {
      const newCard = genBoard(1, [...hand, ...board])[0];

      set(() => ({
        phase: phase === "flop" ? "turn" : phase === "turn" ? "river" : "river",
        stack: newStack,
        score: deltaScore,
        ...(phase === "river" ? {} : { board: [...board, newCard] }),
      }));
    } else {
      set(() => ({
        score: deltaScore,
      }));
    }
  },
  // フェーズを進める（現在の状態を見て自動で判断）
  switchNextPhase: () => {
    const { hand, phase, preflop, flop, turn, shuffleAndDeal } = get();
    if (phase === "preflop") {
      if (preflop === "fold") {
        shuffleAndDeal();
      }
    }

    if (phase === "flop") {
      if (flop === "fold") {
        shuffleAndDeal();
      } else {
        const { board: currentBoard } = get();
        const newCard = genBoard(1, [...hand, ...currentBoard])[0];
        set(() => ({
          phase: "turn",
          board: [...currentBoard, newCard],
        }));
      }
    }

    if (phase === "turn") {
      if (turn === "fold") {
        shuffleAndDeal();
      } else {
        const { board: currentBoard } = get();
        const newCard = genBoard(1, [...hand, ...currentBoard])[0];
        set(() => ({
          phase: "river",
          board: [...currentBoard, newCard],
        }));
      }
    }

    if (phase === "river") {
      shuffleAndDeal();
    }
  },
}));

export { useActionStore };

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
  otherPlayersHands: string[][]; // 他プレイヤーのハンド
  showedHand: boolean; // ハンドを見たかどうか

  // action
  preflop: PreflopAction | null;

  // history
  histories: History[];
};

type Actions = {
  reset: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  showHand: () => void;
  preflopAction: (action: PreflopAction) => void;
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
  shuffleAndDeal: (options?: { tier?: number; people?: number }) => {
    const { stack } = get();
    const people = options?.people ?? PEOPLE;
    const position = genPositionNumber(people);

    const playerHand = genHands(0);
    const otherPlayersHands: string[][] = [];
    for (let i = 1; i < people - position; i++) {
      const hands = genHands(0, [...playerHand, ...otherPlayersHands.flat()]);
      otherPlayersHands.push(hands);
    }

    set(() => ({
      ...INITIAL_STATE,
      position,
      hand: playerHand,
      otherPlayersHands,
      stack,
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
      });
    }
  },
  // フェーズを進める（現在の状態を見て自動で判断）
  switchNextPhase: () => {
    const { phase, preflop, shuffleAndDeal } = get();
    if (phase === "preflop") {
      if (preflop === "fold") {
        shuffleAndDeal();
      }
    }
  },
}));

export { useActionStore };

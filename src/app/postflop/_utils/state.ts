// @ts-expect-error
import { calculateEquity } from "poker-odds";
import { create } from "zustand";
import { getCombos as calcCombos } from "@/utils/calcCombo";
import { genBoard, genHands } from "@/utils/dealer";
import { getResult } from "@/utils/getResult";

type Phase = "flop" | "turn" | "river";

type State = {
  phase: Phase;
  state: "initial" | "result";
  showedHand: boolean;
  position: number;
  hands: string[];
  board: string[];
  answer: string;
};

type Actions = {
  setShowedHand: (newValue: boolean) => void;
  setPosition: () => void;
  setHands: () => void;
  setBoard: () => void;
  setPhase: (phase: Phase) => void;
  setState: (state: "initial" | "result") => void;
  setAnswer: (answer: string) => void;
  getCombos: () => ReturnType<typeof calcCombos> | null; // null when board is not ready for evaluation
  getResult: () => boolean;
  getOdds: () => ReturnType<typeof calculateEquity>;
};

type Store = State & Actions;

const useActionStore = create<Store>((set, get) => ({
  phase: "flop",
  state: "initial",
  position: 0,
  hands: [],
  board: [],
  answer: "",
  showedHand: false,
  setShowedHand: (newValue: boolean) => set(() => ({ showedHand: newValue })),
  setPosition: () => set(() => ({ position: Math.floor(Math.random() * 6) })),
  setHands: () => set(() => ({ hands: genHands() })),
  setBoard: () =>
    set(() => {
      const { hands } = get();
      const board = genBoard(4, hands);

      return { board };
    }),
  setPhase: (phase: Phase) => set(() => ({ phase })),
  setState: (state: "initial" | "result") => set(() => ({ state })),
  setAnswer: (answer: string) => set(() => ({ answer })),
  getCombos: () => {
    const { board, hands } = get();
    // calcCombos throws if length < 3
    if (board.length < 3) return null;
    const evaluationBoard = [...board, ...hands];
    return calcCombos(evaluationBoard);
  },
  getResult: () => {
    const { hands, position, answer } = get();
    if (hands.length !== 2) return false;

    return getResult(hands, position) === answer;
  },
  getOdds: () => {
    const { hands, board } = get();
    if (hands.length !== 2 || board.length < 3) {
      return null;
    }
    const results = calculateEquity([hands], board, 100); // 100 simulations

    return results;
  },
}));

export { useActionStore };

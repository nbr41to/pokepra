import { create } from "zustand";
import { getCombos as calcCombos } from "@/utils/calcCombo";
import { getResult } from "@/utils/getResult";

type Phase = "preflop" | "flop" | "turn" | "river";

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
  showHand: () => void;
  setPosition: () => void;
  setHands: (hands: string[]) => void;
  setBoard: (board: string[]) => void;
  setState: (state: "initial" | "result") => void;
  setAnswer: (answer: string) => void;
  getCombos: () => ReturnType<typeof calcCombos> | null; // null when board is not ready for evaluation
  getResult: () => boolean;
};

type Store = State & Actions;

const useActionStore = create<Store>((set, get) => ({
  phase: "preflop",
  state: "initial",
  position: 0,
  hands: [],
  board: [],
  answer: "",
  showedHand: false,
  showHand: () => set(() => ({ showedHand: true })),
  setPosition: () => set(() => ({ position: Math.floor(Math.random() * 6) })),
  setHands: (hands: string[]) => set(() => ({ hands })),
  setBoard: (board: string[]) => set(() => ({ board })),
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

    return getResult(hands, String(position)) === answer;
  },
}));

export { useActionStore };

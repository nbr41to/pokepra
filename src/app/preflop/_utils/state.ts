import { create } from "zustand";
import { getCombos as calcCombos } from "@/utils/calcCombo";
import { genHands } from "@/utils/dealer";
import { getResult } from "@/utils/getResult";

type State = {
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
  setBoard: (board: string[]) => void;
  setState: (state: "initial" | "result") => void;
  setAnswer: (answer: string) => void;
  getCombos: () => ReturnType<typeof calcCombos> | null; // null when board is not ready for evaluation
  getResult: () => boolean;
};

type Store = State & Actions;

const useActionStore = create<Store>((set, get) => ({
  state: "initial",
  position: 0,
  hands: [],
  board: [],
  answer: "",
  showedHand: false,
  setShowedHand: (newValue: boolean) => set(() => ({ showedHand: newValue })),
  setPosition: () => set(() => ({ position: Math.floor(Math.random() * 6) })),
  setHands: () => set(() => ({ hands: genHands(8) })),
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
    console.log(hands, position, answer);
    if (hands.length !== 2) return false;

    return getResult(hands, position) === answer;
  },
}));

export { useActionStore };

// @ts-expect-error
import { calculateEquity } from "poker-odds";
import { create } from "zustand";
import { iterateSimulations } from "@/lib/poker/simulation";
import { getAllHands } from "@/utils/calcCombo";
import { genBoard, genHands } from "@/utils/dealer";
import { getResult } from "@/utils/getResult";

type Phase = "preflop" | "flop" | "turn" | "river";

type History = {
  hand: string[];
  position: number;
  board: string[];
  preflop: "raise" | "call" | "fold";
  flop: number;
  turn: number;
  river: number;
};

type State = {
  phase: Phase;
  state: "initial" | "reception" | "confirm";
  position: number;
  hand: string[];
  board: string[];
  answer: string;
  simulationScore: Map<string, { name: string; count: number; rank: number }>;
};

type Actions = {
  /* 初期化 */
  initialize: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  showHand: () => void;
  preflopAction: (action: "open-raise" | "fold") => void;
  switchNextPhase: () => void;
  getResult: () => boolean;
  getOdds: () => ReturnType<typeof calculateEquity>;
  startSimulation: () => Promise<any>;
};

type Store = State & Actions;

const INITIAL_STATE: State = {
  phase: "flop",
  state: "initial",
  position: 0,
  hand: [],
  board: [],
  answer: "",
  simulationScore: new Map(),
};

const useActionStore = create<Store>((set, get) => ({
  /* State */
  phase: "flop",
  state: "initial",
  position: 0,
  hand: [],
  board: [],
  answer: "",
  /* Action */
  initialize: () => {
    set(() => INITIAL_STATE);
  },
  simulationScore: new Map(),
  shuffleAndDeal: ({ tier = 0, people = 7 } = { tier: 0, people: 7 }) => {
    const position = Math.floor(Math.random() * people);
    const hand = genHands(tier);
    set(() => ({ phase: "preflop", state: "initial", position, hand }));
  },
  // ハンドを確認
  showHand: () => {
    set(() => ({ state: "reception" }));
  },
  // プリフロップのアクション
  preflopAction: (action: "open-raise" | "fold") => {
    if (action === "fold") {
      const { shuffleAndDeal } = get();
      shuffleAndDeal({ tier: 7, people: 7 });
      return;
    }
    set(() => ({ state: "confirm", answer: action }));
  },
  // フェーズを進める（現在の状態を見て自動で判断）
  switchNextPhase: () => {
    const { hand, phase, answer, shuffleAndDeal } = get();
    if (phase === "preflop") {
      if (answer === "fold") {
        shuffleAndDeal();
      } else {
        // set board for flop
        const board = genBoard(3, hand);
        set(() => ({ phase: "flop", state: "reception", board }));
      }
      return;
    }
  },

  // フロップのアクション
  // ターンのボード設定
  // ターンのアクション
  // リバーのボード設定
  // リバーのアクション
  startSimulation: async () => {
    const timeStart = performance.now();
    console.log("startSimulation: start");
    const { hand, board } = get();
    const allHands = getAllHands(board);

    const results = await Promise.all(
      allHands.map(async (hand) => {
        const result = await iterateSimulations([...board, ...hand], 100);
        const score = result.reduce(
          (acc, curr) => acc + curr.count * curr.rank,
          0,
        );
        return {
          hand,
          result,
          score,
        };
      }),
    );

    const totalScore = results.reduce((acc, curr) => {
      return acc + curr.score;
    }, 0);
    const averageScore = totalScore / results.length;
    console.log(
      "startSimulation:handScore",
      results.find((r) => r.hand[0] === hand[0] && r.hand[1] === hand[1])
        ?.score,
    );
    console.log("startSimulation:averageScore", averageScore);

    // console.log("startSimulation:results", results);

    const durationMs = performance.now() - timeStart;
    console.log(`startSimulation: end ${durationMs.toFixed(2)}ms`);

    return results;
  },
  getResult: () => {
    const { hand, position, answer } = get();
    if (hand.length !== 2) return false;

    return getResult(hand, position) === answer;
  },
  getOdds: () => {
    const { hand, board } = get();
    if (hand.length !== 2 || board.length < 3) {
      return null;
    }
    const results = calculateEquity([hand, ["Ac", "Kd"]], board, 100); // 100 simulations
    console.log("getOdds:results", results);
    return results;
  },
}));

export { useActionStore };

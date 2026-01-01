import { create } from "zustand";
import {
  iterateSimulations,
  iterateWinSimulations,
} from "@/lib/poker/simulation";
import { genBoard, genHands, getHandsByTiers } from "@/utils/dealer";
import { genPositionNumber } from "@/utils/position";
import { getTierIndexByPosition, judgeInRange } from "@/utils/preflop-range";

const PEOPLE = 9;
const DEFAULT_TIER = 6;

type Phase = "preflop" | "flop" | "turn" | "river";
type PreflopAction = "open-raise" | "fold";

type SumilationScore = {
  name: string;
  count: number;
  rank: number;
};
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

  // score
  simulationScores: Map<
    string,
    { name: string; count: number; rank: number }
  >[];
  simulationAverageScore: number;

  // history
  histories: History[];
};

type Actions = {
  /* 初期化 */
  reset: () => void;
  shuffleAndDeal: (options?: { tier: number; people: number }) => void;
  showHand: () => void;
  preflopAction: (action: PreflopAction) => void;
  postflopAction: (phase: Phase, action: "commit" | "fold") => Promise<void>;
  switchNextPhase: () => void;
  startSimulation: () => Promise<any>;
  getEquity: () => Promise<number>;
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

  simulationScores: [],
  simulationAverageScore: 0,

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
        score: amount,
        stack: stack + amount,
      });
    } else {
      const board = genBoard(3, hand);
      set(() => ({ phase: "flop", board, score: 0 }));

      set({
        preflop: action,
        score: amount,
        stack: stack + amount,
        phase: "flop",
        board,
      });
    }
  },
  postflopAction: async (phase: Phase, action: "commit" | "fold") => {
    if (phase === "flop") {
      set(() => ({ flop: action }));
    } else if (phase === "turn") {
      set(() => ({ turn: action }));
    } else if (phase === "river") {
      set(() => ({ river: action }));
    }

    const { stack, hand, board, getEquity } = get();
    const M = 100; // 倍率
    const BASE_LINE = 0.5; // 基準点
    const equity = await getEquity();
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

  getEquity: async () => {
    // 重い処理が入るので先に Web Worker に逃がす必要がある
    await new Promise((resolve) => setTimeout(resolve, 0));

    console.log("startWinSimulation: start");
    const timeStart = performance.now();
    const { position, hand: fixHand, board } = get();

    const allHands = getHandsByTiers(getTierIndexByPosition(position), [
      ...board,
      ...fixHand,
    ]);

    const ITERATIONS = 100;
    const COUNT = allHands.length * ITERATIONS;

    const simulateResults = await Promise.all(
      allHands.map(async (hand) => {
        const result = await iterateWinSimulations(
          [fixHand, hand],
          board,
          ITERATIONS,
        );

        return {
          hand,
          result,
        };
      }),
    );

    // fixHand の勝率計算
    let win = 0;
    let lose = 0;
    let tie = 0;

    simulateResults.forEach(({ result }) => {
      const fixHandResult = result.find(
        (r) => r.hand[0] === fixHand[0] && r.hand[1] === fixHand[1],
      );
      if (fixHandResult) {
        win += fixHandResult.wins;
        lose += fixHandResult.loses;
        tie += fixHandResult.ties;
      }
    });

    const equity = {
      winRate: win / COUNT,
      loseRate: lose / COUNT,
      tieRate: tie / COUNT,
    };

    console.log("startWinSimulation:equity", equity.winRate.toFixed(2));

    const durationMs = performance.now() - timeStart;
    console.log(`startWinSimulation: end ${durationMs.toFixed(2)}ms`);

    return equity.winRate;
  },

  // hand strength をシミュレーションで計算するための試作
  startSimulation: async () => {
    const timeStart = performance.now();
    console.log("startSimulation: start");
    const { board } = get();
    const allHands = getHandsByTiers(DEFAULT_TIER + 1, board);

    const results = await Promise.all(
      allHands.map(async (hand) => {
        const result = await iterateSimulations([...board, ...hand], 100);

        return {
          hand,
          result,
        };
      }),
    );

    const ranking: {
      rank: number; // 約の強さ1〜9
      name: string; // 約の名前
      count: number; // その約が出た回数
      hands: {
        hand: string[]; // ハンド
        count: number; // そのハンドでその約が出た回数
      }[];
    }[] = [];

    results.forEach(({ hand, result }) => {
      result.forEach(({ name, rank, count }) => {
        const existing = ranking.find((r) => r.name === name);
        if (existing) {
          existing.count += count;
          existing.hands.push({ hand, count });
        } else {
          ranking.push({
            name,
            rank,
            count,
            hands: [{ hand, count }],
          });
        }
      });
    });

    ranking.sort((a, b) => b.rank - a.rank);

    console.log("ranking", ranking);

    // console.log("startSimulation:results", results);

    const durationMs = performance.now() - timeStart;
    console.log(`startSimulation: end ${durationMs.toFixed(2)}ms`);

    return results;
  },
}));

export { useActionStore };

export type WasmExports = {
  memory: WebAssembly.Memory;
  simulate_vs_list_equity?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_vs_list_equity_with_progress?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_rank_distribution?: (
    handsPtr: number,
    handsLen: number,
    boardPtr: number,
    boardLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_rank_distribution_with_progress?: (
    handsPtr: number,
    handsLen: number,
    boardPtr: number,
    boardLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_vs_list_with_ranks?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_vs_list_with_ranks_monte_carlo?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_vs_list_with_ranks_with_progress?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
};

export type RankResults = {
  "High Card": number;
  "One Pair": number;
  "Two Pair": number;
  "Three of a Kind": number;
  Straight: number;
  Flush: number;
  "Full House": number;
  "Four of a Kind": number;
  "Straight Flush": number;
};

export type CombinedEntry = {
  hand: string;
  count: number;
  win: number;
  tie: number;
  results: RankResults;
};

export type CombinedPayload = {
  hand: string;
  equity: number;
  data: CombinedEntry[];
};

export type EquityEntry = {
  hand: string;
  equity: number;
};

export type EquityPayload = {
  hand: string;
  equity: number;
  data: EquityEntry[];
};

export type SimulateParams = {
  hero: string[];
  board: string[];
  compare: string[][];
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
};

export type SimulateWithProgressParams = SimulateParams & {
  onProgress?: (pct: number) => void;
};

export type RankDistributionParams = {
  hands: string[][];
  board: string[];
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
};

export type RankDistributionWithProgressParams = RankDistributionParams & {
  onProgress?: (pct: number) => void;
};

export type RankDistributionEntry = {
  hand: string;
  results: RankResults;
};

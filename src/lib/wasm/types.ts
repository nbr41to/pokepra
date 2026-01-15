export type WasmExports = {
  memory: WebAssembly.Memory;
  evaluate_hands_ranking?: (
    handsPtr: number,
    handsLen: number,
    boardPtr: number,
    boardLen: number,
    outPtr: number,
    outLen: number,
  ) => number;
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
  parse_range_to_hands?: (
    rangePtr: number,
    rangeLen: number,
    outPtr: number,
    outLen: number,
  ) => number;
};

export type RankOutcome = {
  win: number;
  tie: number;
  lose: number;
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

export type RankOutcomeResults = {
  "High Card": RankOutcome;
  "One Pair": RankOutcome;
  "Two Pair": RankOutcome;
  "Three of a Kind": RankOutcome;
  Straight: RankOutcome;
  Flush: RankOutcome;
  "Full House": RankOutcome;
  "Four of a Kind": RankOutcome;
  "Straight Flush": RankOutcome;
};

export type CombinedEntry = {
  hand: string;
  count: number;
  win: number;
  tie: number;
  lose: number;
  results: RankOutcomeResults;
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

export type ParseRangeParams = {
  range: string;
  wasmUrl?: string;
};

export type EvaluateHandsRankingParams = {
  hands: string[][];
  board: string[];
  wasmUrl?: string;
};

export type HandRankingEntry = {
  hand: string;
  rankIndex: number;
  rankName: string;
  encoded: number;
  kickers: number[];
};

export type RankDistributionEntry = {
  hand: string;
  results: RankResults;
};

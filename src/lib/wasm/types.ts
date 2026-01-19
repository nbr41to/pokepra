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
  simulate_range_vs_range_equity?: (
    heroPtr: number,
    heroLen: number,
    villainPtr: number,
    villainLen: number,
    boardPtr: number,
    boardLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_range_vs_range_equity_with_progress?: (
    heroPtr: number,
    heroLen: number,
    villainPtr: number,
    villainLen: number,
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
  simulate_vs_list_with_ranks_trace?: (
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
  simulate_open_ranges_monte_carlo?: (
    heroPtr: number,
    heroLen: number,
    opponentsPtr: number,
    opponentsLen: number,
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

export type RangeEquityEntry = {
  hand: string;
  equity: number;
};

export type RangeVsRangePayload = {
  hero: RangeEquityEntry[];
  villain: RangeEquityEntry[];
};

export type MonteCarloTraceEntry = {
  hero: string;
  board: string;
  villain: string;
  outcome: "hero" | "villain" | "tie";
  rankIndex: number;
  rankName: string;
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

export type RangeVsRangeParams = {
  heroRange: string;
  villainRange: string;
  board: string[];
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
};

export type RangeVsRangeWithProgressParams = RangeVsRangeParams & {
  onProgress?: (pct: number) => void;
};

export type ParseRangeParams = {
  range: string;
  wasmUrl?: string;
  excludedCards?: string[];
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

export type OpenRangesParams = {
  heroRange: string;
  opponentRanges: string[];
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
};

export type OpenRangesWithProgressParams = OpenRangesParams & {
  onProgress?: (pct: number) => void;
};

export type OpenRangesPayload = {
  heroRange: string;
  opponentRanges: string[];
  wins: number;
  ties: number;
  plays: number;
  equity: number;
  rankWins: RankResults;
};

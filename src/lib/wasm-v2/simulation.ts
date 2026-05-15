import type {
  CombinedPayload,
  EquityPayload,
  EvaluateHandsRankingParams,
  HandRankingEntry,
  ParseRangeParams,
  RangeVsRangeParams,
  RangeVsRangePayload,
  SimulateParams,
} from "@/lib/wasm-v1/types";
import init, {
  evaluate_hands_ranking as wasmEvaluateHandsRanking,
  parse_range_to_hands as wasmParseRangeToHands,
  simulate_range_vs_range_equity as wasmSimulateRangeVsRangeEquity,
  simulate_vs_list_equity as wasmSimulateVsListEquity,
  simulate_vs_list_with_ranks as wasmSimulateVsListWithRanks,
} from "./pkg/pokepra_wasm";

export type {
  CombinedPayload,
  EquityEntry,
  EquityPayload,
  EvaluateHandsRankingParams,
  HandRankingEntry,
  ParseRangeParams,
  RangeEquityEntry,
  RangeVsRangeParams,
  RangeVsRangePayload,
  SimulateParams,
} from "@/lib/wasm-v1/types";

const DEFAULT_SEED = 123_456_789n;

let initPromise: Promise<unknown> | null = null;

const ensureLoaded = () => {
  if (!initPromise) {
    initPromise = init();
  }
  return initPromise;
};

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const joinHands = (hands: string[][]) =>
  hands
    .filter((h) => h.length > 0)
    .map((h) => h.join(" "))
    .join("; ");

const normalizeRangeInput = (range: string | string[][]) => {
  if (Array.isArray(range)) {
    return range
      .map((h) => h.join("").trim())
      .filter(Boolean)
      .join(",");
  }
  return range;
};

type SimulateVsListWithRanksParams = SimulateParams & {
  onProgress?: (pct: number) => void;
};

export async function simulateVsListWithRanks(
  params: SimulateVsListWithRanksParams,
): Promise<CombinedPayload> {
  await ensureLoaded();
  const {
    hero,
    board,
    compare,
    trials,
    seed = DEFAULT_SEED,
    onProgress,
  } = params;

  const heroStr = hero.join(" ").trim();
  const boardStr = board.join(" ").trim();
  const compareStr = joinHands(compare).trim();

  if (heroStr.length < 4 || !compareStr) {
    return { hand: heroStr, equity: 0, data: [] };
  }

  onProgress?.(0);
  await yieldToBrowser();

  const result = wasmSimulateVsListWithRanks(
    heroStr,
    boardStr,
    compareStr,
    trials,
    seed,
  ) as CombinedPayload;

  onProgress?.(100);
  return result;
}

export async function evaluateHandsRanking(
  params: EvaluateHandsRankingParams,
): Promise<HandRankingEntry[]> {
  await ensureLoaded();
  const { hands, board } = params;
  if (hands.length === 0 || board.length === 0) return [];
  const handsStr = joinHands(hands).trim();
  const boardStr = board.join(" ").trim();
  return wasmEvaluateHandsRanking(handsStr, boardStr) as HandRankingEntry[];
}

type SimulateVsListEquityParams = SimulateParams & {
  onProgress?: (pct: number) => void;
};

export async function simulateVsListEquity(
  params: SimulateVsListEquityParams,
): Promise<EquityPayload> {
  await ensureLoaded();
  const {
    hero,
    board,
    compare,
    trials,
    seed = DEFAULT_SEED,
    include,
    onProgress,
  } = params;

  const heroStr = hero.join(" ").trim();
  const boardStr = board.join(" ").trim();
  const compareStr = joinHands(compare).trim();

  if (heroStr.length < 4 || !compareStr) {
    return { hand: heroStr, equity: 0, data: [] };
  }

  onProgress?.(0);
  await yieldToBrowser();

  const result = wasmSimulateVsListEquity(
    heroStr,
    boardStr,
    compareStr,
    trials,
    seed,
    include?.data === true,
  ) as EquityPayload;

  onProgress?.(100);
  return result;
}

export async function parseRangeToHands(
  params: ParseRangeParams,
): Promise<string[][]> {
  await ensureLoaded();
  const { range, excludedCards = [] } = params;
  const trimmed = range.trim();
  if (!trimmed) return [];
  const excluded = excludedCards.join(" ").trim();
  const result = wasmParseRangeToHands(trimmed, excluded) as string[][];
  return result;
}

type RangeVsRangeParamsWithProgress = RangeVsRangeParams & {
  onProgress?: (pct: number) => void;
};

export async function simulateRangeVsRangeEquity(
  params: RangeVsRangeParamsWithProgress,
): Promise<RangeVsRangePayload> {
  await ensureLoaded();
  const {
    heroRange,
    villainRange,
    board,
    trials,
    seed = DEFAULT_SEED,
    onProgress,
  } = params;

  const heroStr = normalizeRangeInput(heroRange).trim();
  const villainStr = normalizeRangeInput(villainRange).trim();
  const boardStr = board.join(" ").trim();

  if (!heroStr || !villainStr) {
    return { hero: [], villain: [] };
  }

  onProgress?.(0);
  await yieldToBrowser();

  const result = wasmSimulateRangeVsRangeEquity(
    heroStr,
    villainStr,
    boardStr,
    trials,
    seed,
  ) as RangeVsRangePayload;

  onProgress?.(100);
  return result;
}

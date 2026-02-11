import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm } from "../loader";
import type {
  OpenRangesParams,
  OpenRangesPayload,
  RankResults,
} from "../types";

const RANK_LABELS: (keyof RankResults)[] = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
];

const buildRankResults = (counts: ArrayLike<number>): RankResults => {
  const results = {} as RankResults;
  for (let i = 0; i < RANK_LABELS.length; i += 1) {
    results[RANK_LABELS[i]] = counts[i] ?? 0;
  }
  return results;
};

export async function runSimulateOpenRangesMonteCarlo({
  heroRange,
  opponentRanges,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: OpenRangesParams): Promise<OpenRangesPayload> {
  const heroTrimmed = heroRange.trim();
  const opponentTrimmed = opponentRanges
    .map((range) => range.trim())
    .filter(Boolean);

  if (!heroTrimmed || opponentTrimmed.length === 0) {
    return {
      heroRange: heroTrimmed,
      opponentRanges: opponentTrimmed,
      wins: 0,
      ties: 0,
      plays: 0,
      equity: 0,
      rankWins: buildRankResults([]),
    };
  }

  const { exports, memory } = await loadWasm(wasmUrl);
  const simulate = exports.simulate_open_ranges_monte_carlo;
  if (typeof simulate !== "function") {
    throw new Error("WASM export 'simulate_open_ranges_monte_carlo' not found");
  }

  const { writeString, allocU32 } = createHeap(memory);
  const heroBuf = writeString(heroTrimmed);
  const opponentsBuf = writeString(opponentTrimmed.join("; "));

  const outLen = 12;
  const outPtr = allocU32(outLen);

  const rc = simulate(
    heroBuf.ptr,
    heroBuf.len,
    opponentsBuf.ptr,
    opponentsBuf.len,
    trials,
    seed,
    outPtr,
    outLen,
  );
  if (rc < 0) {
    throw new Error(`simulate_open_ranges_monte_carlo failed with code ${rc}`);
  }

  const out = new Uint32Array(memory.buffer, outPtr, outLen);
  const wins = out[0] ?? 0;
  const ties = out[1] ?? 0;
  const plays = out[2] ?? 0;
  const rankWins = buildRankResults(out.subarray(3, 12));
  const equity = plays === 0 ? 0 : (wins + ties * 0.5) / plays;

  return {
    heroRange: heroTrimmed,
    opponentRanges: opponentTrimmed,
    wins,
    ties,
    plays,
    equity,
    rankWins,
  };
}

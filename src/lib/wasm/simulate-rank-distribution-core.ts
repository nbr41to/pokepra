import { DEFAULT_WASM_URL } from "./constants";
import { createHeap, loadWasm, setProgressListener } from "./loader";
import type {
  RankDistributionEntry,
  RankDistributionParams,
  RankResults,
} from "./types";

export async function runSimulateRankDistribution(
  {
    hands,
    board,
    trials,
    seed = 123456789n,
    wasmUrl = DEFAULT_WASM_URL,
  }: RankDistributionParams,
  {
    onProgress,
    useProgressExport = false,
  }: { onProgress?: (pct: number) => void; useProgressExport?: boolean },
): Promise<RankDistributionEntry[]> {
  const handsTrimmed = hands
    .map((hand) => hand.join(" ").trim())
    .filter(Boolean);
  const handsStr = handsTrimmed.join("; ");
  const boardStr = board.join(" ");

  if (handsTrimmed.length === 0 || board.length < 3 || board.length > 5) {
    return [];
  }

  const { exports, memory } = await loadWasm(wasmUrl);
  const wantsProgress = useProgressExport || typeof onProgress === "function";
  const simulate = wantsProgress
    ? exports.simulate_rank_distribution_with_progress
    : exports.simulate_rank_distribution;
  if (typeof simulate !== "function") {
    const missing = wantsProgress
      ? "simulate_rank_distribution_with_progress"
      : "simulate_rank_distribution";
    throw new Error(`WASM export '${missing}' not found`);
  }

  const { writeString, allocU32 } = createHeap(memory);
  const handsBuf = writeString(handsStr);
  const boardBuf = writeString(boardStr);

  const outLen = handsTrimmed.length * 9;
  const outPtr = allocU32(outLen);

  let rc: number;
  setProgressListener(onProgress ?? null);
  try {
    rc = simulate(
      handsBuf.ptr,
      handsBuf.len,
      boardBuf.ptr,
      boardBuf.len,
      trials,
      seed,
      outPtr,
      outLen,
    );
  } finally {
    setProgressListener(null);
  }
  if (rc < 0) {
    throw new Error(
      wantsProgress
        ? `simulate_rank_distribution_with_progress failed with code ${rc}`
        : `simulate_rank_distribution failed with code ${rc}`,
    );
  }
  if (rc === 0) {
    return [];
  }

  const out = new Uint32Array(memory.buffer, outPtr, rc * 9);
  const labels: (keyof RankResults)[] = [
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

  const data: RankDistributionEntry[] = [];
  for (let i = 0; i < rc; i += 1) {
    const base = i * 9;
    const chunk = out.subarray(base, base + 9);
    const resultsObject = {} as RankResults;
    for (let r = 0; r < labels.length; r += 1) {
      resultsObject[labels[r]] = chunk[r] ?? 0;
    }
    data.push({
      hand: handsTrimmed[i] ?? "",
      results: resultsObject,
    });
  }

  return data;
}

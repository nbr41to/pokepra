import { DEFAULT_WASM_URL } from "./constants";
import { createHeap, loadWasm } from "./loader";
import type { MonteCarloTraceEntry, SimulateParams } from "./types";

const RANK_LABELS = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
] as const;

const decodeCard = (v: number) => {
  const rank = v >> 2;
  const suit = v & 0b11;
  const rankChar = "23456789TJQKA"[rank] ?? "?";
  const suitChar = ["s", "h", "d", "c"][suit] ?? "?";
  return `${rankChar}${suitChar}`;
};

const outcomeLabel = (outcome: number) => {
  if (outcome === 0) return "hero";
  if (outcome === 1) return "villain";
  return "tie";
};

export async function runSimulateVsListWithRanksTrace({
  hero,
  board,
  compare,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: SimulateParams): Promise<MonteCarloTraceEntry[]> {
  const [heroStr, boardStr, compareStr] = [
    hero.join(" "),
    board.join(" "),
    compare.join("; ").replaceAll(",", " "),
  ];

  if (heroStr.trim().length < 4 || compareStr.trim().length < 2) {
    return [];
  }

  const heroTrimmed = heroStr.trim();
  const boardTrimmed = boardStr.trim();
  const compareTrimmed = compareStr.trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  const simulate = exports.simulate_vs_list_with_ranks_trace;
  if (typeof simulate !== "function") {
    throw new Error(
      "WASM export 'simulate_vs_list_with_ranks_trace' not found",
    );
  }

  const { writeString, allocU32 } = createHeap(memory);
  const heroBuf = writeString(heroTrimmed);
  const boardBuf = writeString(boardTrimmed);
  const compareBuf = writeString(compareTrimmed);

  const handList = compareTrimmed
    .split(";")
    .map((h) => h.trim())
    .filter(Boolean);
  const compareCount = handList.length;
  if (compareCount === 0) {
    throw new Error("No compare hands provided");
  }

  const records = compareCount * Math.max(trials, 1);
  const outLen = records * 11;
  const outPtr = allocU32(outLen);

  const rc = simulate(
    heroBuf.ptr,
    heroBuf.len,
    boardBuf.ptr,
    boardBuf.len,
    compareBuf.ptr,
    compareBuf.len,
    trials,
    seed,
    outPtr,
    outLen,
  );
  if (rc < 0) {
    throw new Error(`simulate_vs_list_with_ranks_trace failed with code ${rc}`);
  }
  if (rc === 0) {
    return [];
  }

  const out = new Uint32Array(memory.buffer, outPtr, rc * 11);
  const data: MonteCarloTraceEntry[] = [];

  for (let i = 0; i < rc; i += 1) {
    const base = i * 11;
    const chunk = out.subarray(base, base + 11);
    const heroCards = `${decodeCard(chunk[0])} ${decodeCard(chunk[1])}`;
    const boardCards = [
      decodeCard(chunk[2]),
      decodeCard(chunk[3]),
      decodeCard(chunk[4]),
      decodeCard(chunk[5]),
      decodeCard(chunk[6]),
    ].join(" ");
    const villainCards = `${decodeCard(chunk[7])} ${decodeCard(chunk[8])}`;
    const outcome = outcomeLabel(chunk[9]);
    const rankIndex = chunk[10];
    const rankName = RANK_LABELS[rankIndex] ?? "Unknown";

    data.push({
      hero: heroCards,
      board: boardCards,
      villain: villainCards,
      outcome,
      rankIndex,
      rankName,
    });
  }

  return data;
}

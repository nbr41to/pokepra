import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm } from "../loader";
import type { EvaluateHandsRankingParams, HandRankingEntry } from "../types";

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

// Main-thread WASM call (not worker-backed).
export async function evaluateHandsRanking({
  hands,
  board,
  wasmUrl = DEFAULT_WASM_URL,
}: EvaluateHandsRankingParams): Promise<HandRankingEntry[]> {
  const start = performance.now(); // For performance measurement
  if (hands.length === 0 || board.length === 0) return [];

  const handsStr = hands
    .map((hand) => hand.join(" "))
    .join("; ")
    .trim();
  const boardStr = board.join(" ").trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  if (typeof exports.evaluate_hands_ranking !== "function") {
    throw new Error("WASM export 'evaluate_hands_ranking' not found");
  }

  const { writeString, allocU32 } = createHeap(memory);
  const handsBuf = writeString(handsStr);
  const boardBuf = writeString(boardStr);

  const outLen = hands.length * 9;
  const outPtr = allocU32(outLen);

  const rc = exports.evaluate_hands_ranking(
    handsBuf.ptr,
    handsBuf.len,
    boardBuf.ptr,
    boardBuf.len,
    outPtr,
    outLen,
  );
  if (rc < 0) {
    throw new Error(`evaluate_hands_ranking failed with code ${rc}`);
  }
  if (rc === 0) return [];

  const out = new Uint32Array(memory.buffer, outPtr, rc * 9);
  const entries: HandRankingEntry[] = [];
  for (let i = 0; i < rc; i += 1) {
    const base = i * 9;
    const card1 = decodeCard(out[base] ?? 0);
    const card2 = decodeCard(out[base + 1] ?? 0);
    const rankIndex = out[base + 2] ?? 0;
    const encoded = out[base + 3] ?? 0;
    const kickers = Array.from(out.slice(base + 4, base + 9));
    entries.push({
      hand: `${card1} ${card2}`,
      rankIndex,
      rankName: RANK_LABELS[rankIndex] ?? "Unknown",
      encoded,
      kickers,
    });
  }

  const end = performance.now();
  console.log(`evaluateHandsRanking took ${(end - start).toFixed(2)} ms`);

  return entries;
}

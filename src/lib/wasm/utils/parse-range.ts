import { CARD_RANK_ORDER } from "@/utils/card";
import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm } from "../loader";
import type { ParseRangeParams } from "../types";

const MAX_STARTING_HANDS = 1326;

const decodeCard = (v: number) => {
  const rank = v >> 2;
  const suit = v & 0b11;
  const rankChar = "23456789TJQKA"[rank] ?? "?";
  const suitChar = ["s", "h", "d", "c"][suit] ?? "?";
  return `${rankChar}${suitChar}`;
};

const normalizeCard = (card: string) => {
  const trimmed = card.trim();
  if (trimmed.length === 3 && trimmed.startsWith("10")) {
    return `T${trimmed[2]?.toLowerCase() ?? ""}`;
  }
  if (trimmed.length < 2) {
    return trimmed;
  }
  const rank = trimmed[0]?.toUpperCase() ?? "";
  const suit = trimmed.slice(1).toLowerCase();
  return `${rank}${suit}`;
};

const sortByRankDesc = (a: string, b: string) => {
  const aRank = CARD_RANK_ORDER[a[0] ?? ""] ?? 0;
  const bRank = CARD_RANK_ORDER[b[0] ?? ""] ?? 0;
  return bRank - aRank;
};

export async function parseRangeToHands({
  range,
  wasmUrl = DEFAULT_WASM_URL,
  excludedCards = [],
}: ParseRangeParams): Promise<string[][]> {
  const trimmed = range.trim();
  if (!trimmed) {
    return [];
  }

  const { exports, memory } = await loadWasm(wasmUrl);
  const parseRange = exports.parse_range_to_hands;
  if (typeof parseRange !== "function") {
    throw new Error("WASM export 'parse_range_to_hands' not found");
  }

  const { writeString, allocU32 } = createHeap(memory);
  const rangeBuf = writeString(trimmed);
  const outLen = MAX_STARTING_HANDS * 2;
  const outPtr = allocU32(outLen);

  const rc = parseRange(rangeBuf.ptr, rangeBuf.len, outPtr, outLen);
  if (rc < 0) {
    throw new Error(`parse_range_to_hands failed with code ${rc}`);
  }
  if (rc === 0) {
    return [];
  }

  const excludedSet =
    excludedCards.length > 0 ? new Set(excludedCards.map(normalizeCard)) : null;
  const out = new Uint32Array(memory.buffer, outPtr, rc * 2);
  const hands: string[][] = [];
  for (let i = 0; i < rc; i += 1) {
    const base = i * 2;
    const c1 = decodeCard(out[base] ?? 0);
    const c2 = decodeCard(out[base + 1] ?? 0);
    if (excludedSet && (excludedSet.has(c1) || excludedSet.has(c2))) {
      continue;
    }
    const [high, low] = [c1, c2].sort(sortByRankDesc);
    hands.push([high, low]);
  }
  return hands;
}

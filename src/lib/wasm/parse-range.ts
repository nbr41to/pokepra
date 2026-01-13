import { DEFAULT_WASM_URL } from "./constants";
import { createHeap, loadWasm } from "./loader";
import type { ParseRangeParams } from "./types";

const MAX_STARTING_HANDS = 1326;

const decodeCard = (v: number) => {
  const rank = v >> 2;
  const suit = v & 0b11;
  const rankChar = "23456789TJQKA"[rank] ?? "?";
  const suitChar = ["s", "h", "d", "c"][suit] ?? "?";
  return `${rankChar}${suitChar}`;
};

export async function parseRangeToHands({
  range,
  wasmUrl = DEFAULT_WASM_URL,
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

  const out = new Uint32Array(memory.buffer, outPtr, rc * 2);
  const hands: string[][] = [];
  for (let i = 0; i < rc; i += 1) {
    const base = i * 2;
    const c1 = decodeCard(out[base] ?? 0);
    const c2 = decodeCard(out[base + 1] ?? 0);
    hands.push([c1, c2]);
  }
  return hands;
}

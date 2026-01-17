import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm, setProgressListener } from "../loader";
import type {
  RangeEquityEntry,
  RangeVsRangeParams,
  RangeVsRangePayload,
  RangeVsRangeWithProgressParams,
} from "../types";

const MAX_STARTING_HANDS = 1326;

export async function runSimulateRangeVsRangeEquity({
  heroRange,
  villainRange,
  board,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: RangeVsRangeParams): Promise<RangeVsRangePayload> {
  return runRangeVsRange({
    heroRange,
    villainRange,
    board,
    trials,
    seed,
    wasmUrl,
  });
}

export async function runSimulateRangeVsRangeEquityWithProgress({
  heroRange,
  villainRange,
  board,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
  onProgress,
}: RangeVsRangeWithProgressParams): Promise<RangeVsRangePayload> {
  return runRangeVsRange(
    {
      heroRange,
      villainRange,
      board,
      trials,
      seed,
      wasmUrl,
    },
    { onProgress, useProgressExport: true },
  );
}

async function runRangeVsRange(
  {
    heroRange,
    villainRange,
    board,
    trials,
    seed = 123456789n,
    wasmUrl = DEFAULT_WASM_URL,
  }: RangeVsRangeParams,
  {
    onProgress,
    useProgressExport = false,
  }: { onProgress?: (pct: number) => void; useProgressExport?: boolean } = {},
): Promise<RangeVsRangePayload> {
  const heroTrimmed = heroRange.trim();
  const villainTrimmed = villainRange.trim();
  const boardTrimmed = board.join(" ").trim();

  if (!heroTrimmed || !villainTrimmed) {
    return { hero: [], villain: [] };
  }

  const { exports, memory } = await loadWasm(wasmUrl);
  const wantsProgress = useProgressExport || typeof onProgress === "function";
  const simulate = wantsProgress
    ? exports.simulate_range_vs_range_equity_with_progress
    : exports.simulate_range_vs_range_equity;
  if (typeof simulate !== "function") {
    const missing = wantsProgress
      ? "simulate_range_vs_range_equity_with_progress"
      : "simulate_range_vs_range_equity";
    throw new Error(`WASM export '${missing}' not found`);
  }

  const { writeString, allocU32 } = createHeap(memory);
  const heroBuf = writeString(heroTrimmed);
  const villainBuf = writeString(villainTrimmed);
  const boardBuf = writeString(boardTrimmed);

  const outLen = MAX_STARTING_HANDS * 2 * 4;
  const outPtr = allocU32(outLen);

  let rc: number;
  setProgressListener(onProgress ?? null);
  try {
    rc = simulate(
      heroBuf.ptr,
      heroBuf.len,
      villainBuf.ptr,
      villainBuf.len,
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
        ? `simulate_range_vs_range_equity_with_progress failed with code ${rc}`
        : `simulate_range_vs_range_equity failed with code ${rc}`,
    );
  }
  if (rc === 0) {
    return { hero: [], villain: [] };
  }

  const decodeCard = (v: number) => {
    const rank = v >> 2;
    const suit = v & 0b11;
    const rankChar = "23456789TJQKA"[rank] ?? "?";
    const suitChar = ["s", "h", "d", "c"][suit] ?? "?";
    return `${rankChar}${suitChar}`;
  };

  const out = new Uint32Array(memory.buffer, outPtr, rc * 4);
  const hero: RangeEquityEntry[] = [];
  const villain: RangeEquityEntry[] = [];

  for (let i = 0; i < rc; i += 1) {
    const base = i * 4;
    const chunk = out.subarray(base, base + 4);
    const card1 = decodeCard(chunk[0] ?? 0);
    const card2 = decodeCard(chunk[1] ?? 0);
    const equity = (chunk[2] ?? 0) / 1_000_000;
    const role = chunk[3] ?? 0;
    const entry = {
      hand: `${card1} ${card2}`,
      equity,
    };
    if (role === 1) {
      villain.push(entry);
    } else {
      hero.push(entry);
    }
  }

  hero.sort((a, b) => b.equity - a.equity);
  villain.sort((a, b) => b.equity - a.equity);

  return { hero, villain };
}

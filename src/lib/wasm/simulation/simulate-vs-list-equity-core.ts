import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm, setProgressListener } from "../loader";
import type { EquityEntry, EquityPayload, SimulateParams } from "../types";

export async function runSimulateVsListEquity(
  {
    hero,
    board,
    compare,
    trials,
    opponentsCount = 1,
    seed = 123456789n,
    wasmUrl = DEFAULT_WASM_URL,
    include,
  }: SimulateParams,
  {
    onProgress,
    useProgressExport = false,
  }: { onProgress?: (pct: number) => void; useProgressExport?: boolean } = {},
): Promise<EquityPayload> {
  const start = performance.now(); // For performance measurement
  const includeData = include?.data === true;
  const heroStr = hero.join(" ");
  const boardStr = board.join(" ");
  const compareHands = compare
    .map((hand) => hand.join(" ").replaceAll(",", " ").trim())
    .filter(Boolean);
  const compareStr = compareHands.join("; ");

  if (heroStr.trim().length < 4 || compareStr.trim().length < 2) {
    return {
      hand: heroStr,
      equity: 0,
      data: [],
    };
  }

  const heroTrimmed = heroStr.trim();
  const boardTrimmed = boardStr.trim();
  const compareTrimmed = compareStr.trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  const wantsProgress =
    typeof onProgress === "function" && useProgressExport !== false;
  const simulate = wantsProgress
    ? exports.simulate_vs_list_equity_with_progress
    : exports.simulate_vs_list_equity;
  if (typeof simulate !== "function") {
    const missing = wantsProgress
      ? "simulate_vs_list_equity_with_progress"
      : "simulate_vs_list_equity";
    throw new Error(`WASM export '${missing}' not found`);
  }

  const { writeString, allocU32 } = createHeap(memory);
  const heroBuf = writeString(heroTrimmed);
  const boardBuf = writeString(boardTrimmed);
  const compareBuf = writeString(compareTrimmed);

  const compareCount = compareHands.length;
  if (compareCount === 0) {
    throw new Error("No compare hands provided");
  }
  if (compareCount < opponentsCount) {
    throw new Error("Not enough compare hands for opponents count");
  }

  const handList = includeData ? compareHands : [];
  const outLen = (includeData ? compareCount + 1 : 1) * 5;
  const outPtr = allocU32(outLen);

  let rc: number;
  setProgressListener(wantsProgress ? (onProgress ?? null) : null);
  try {
    rc = simulate(
      heroBuf.ptr,
      heroBuf.len,
      boardBuf.ptr,
      boardBuf.len,
      compareBuf.ptr,
      compareBuf.len,
      Math.max(1, Math.min(5, opponentsCount)),
      trials,
      seed,
      includeData ? 1 : 0,
      outPtr,
      outLen,
    );
  } finally {
    setProgressListener(null);
  }
  if (rc < 0) {
    throw new Error(
      wantsProgress
        ? `simulate_vs_list_equity_with_progress failed with code ${rc}`
        : `simulate_vs_list_equity failed with code ${rc}`,
    );
  }
  if (rc === 0) {
    throw new Error("No records returned from WASM");
  }

  const out = new Uint32Array(memory.buffer, outPtr, rc * 5);
  const data: EquityEntry[] = [];
  let heroEquity = 0;

  for (let i = 0; i < rc; i += 1) {
    const base = i * 5;
    const chunk = out.subarray(base, base + 5);
    const raw1 = chunk[0];
    const raw2 = chunk[1];
    const heroWins = chunk[2];
    const ties = chunk[3];
    const plays = chunk[4];

    const isHero = raw1 === 0xffffffff && raw2 === 0xffffffff;
    if (plays === 0) {
      if (isHero) heroEquity = 0;
      continue;
    }
    if (isHero) {
      heroEquity = (heroWins + ties * 0.5) / plays;
      continue;
    }
    if (includeData) {
      const oppWins = Math.max(0, plays - heroWins - ties);
      const equity = (oppWins + ties * 0.5) / plays;
      data.push({
        hand: handList[i] ?? "",
        equity,
      });
    }
  }

  if (includeData) {
    data.sort((a, b) => b.equity - a.equity);
  }

  const end = performance.now();
  console.info(
    `runSimulateVsListEquity completed in ${(end - start).toFixed(2)} ms`,
  );

  return {
    hand: heroTrimmed,
    equity: heroEquity,
    data,
  };
}

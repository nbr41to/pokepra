import { DEFAULT_WASM_URL } from "./constants";
import { createHeap, loadWasm } from "./loader";
import type { EquityEntry, EquityPayload, SimulateParams } from "./types";

export async function runSimulateVsListEquity({
  hero,
  board,
  compare,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: SimulateParams): Promise<EquityPayload> {
  const [heroStr, boardStr, compareStr] = [
    hero.join(" "),
    board.join(" "),
    compare.join("; ").replaceAll(",", " "),
  ];

  if (
    heroStr.trim().length < 4 ||
    boardStr.trim().length < 6 ||
    compareStr.trim().length < 2
  ) {
    return {
      hand: heroStr,
      equity: 0,
      data: [],
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  const heroTrimmed = heroStr.trim();
  const boardTrimmed = boardStr.trim();
  const compareTrimmed = compareStr.trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  const simulate = exports.simulate_vs_list_equity;
  if (typeof simulate !== "function") {
    throw new Error("WASM export 'simulate_vs_list_equity' not found");
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

  const outLen = (compareCount + 1) * 5;
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
    throw new Error(`simulate_vs_list_equity failed with code ${rc}`);
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
    const oppWins = Math.max(0, plays - heroWins - ties);
    const equity = (oppWins + ties * 0.5) / plays;
    data.push({
      hand: handList[i] ?? "",
      equity,
    });
  }

  data.sort((a, b) => b.equity - a.equity);

  return {
    hand: heroTrimmed,
    equity: heroEquity,
    data,
  };
}

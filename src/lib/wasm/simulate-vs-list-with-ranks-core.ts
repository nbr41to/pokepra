import { DEFAULT_WASM_URL } from "./constants";
import { createHeap, loadWasm, setProgressListener } from "./loader";
import type {
  CombinedEntry,
  CombinedPayload,
  RankResults,
  SimulateParams,
} from "./types";

export async function runSimulateVsListWithRanks(
  {
    hero,
    board,
    compare,
    trials,
    seed = 123456789n,
    wasmUrl = DEFAULT_WASM_URL,
  }: SimulateParams,
  {
    onProgress,
    useProgressExport = false,
  }: { onProgress?: (pct: number) => void; useProgressExport?: boolean },
): Promise<CombinedPayload> {
  const start = performance.now(); // For performance measurement
  const [heroStr, boardStr, compareStr] = [
    hero.join(" "),
    board.join(" "),
    compare.join("; ").replaceAll(",", " "),
  ];

  // 条件を満たさない場合
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

  const heroTrimmed = heroStr.trim();
  const boardTrimmed = boardStr.trim();
  const compareTrimmed = compareStr.trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  const wantsProgress = useProgressExport || typeof onProgress === "function";
  const simulate = wantsProgress
    ? exports.simulate_vs_list_with_ranks_with_progress
    : exports.simulate_vs_list_with_ranks;
  if (typeof simulate !== "function") {
    const missing = wantsProgress
      ? "simulate_vs_list_with_ranks_with_progress"
      : "simulate_vs_list_with_ranks";
    throw new Error(`WASM export '${missing}' not found`);
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

  const outLen = (compareCount + 1) * 14; // opponents + hero aggregate
  const outPtr = allocU32(outLen);

  let rc: number;
  setProgressListener(onProgress ?? null);
  try {
    rc = simulate(
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
  } finally {
    setProgressListener(null);
  }
  if (rc < 0) {
    throw new Error(
      wantsProgress
        ? `simulate_vs_list_with_ranks_with_progress failed with code ${rc}`
        : `simulate_vs_list_with_ranks failed with code ${rc}`,
    );
  }
  const records = rc;
  if (records === 0) {
    throw new Error("No records returned from WASM");
  }

  const out = new Uint32Array(memory.buffer, outPtr, records * 14);
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

  const decodeCard = (v: number) => {
    const rank = v >> 2;
    const suit = v & 0b11;
    const rankChar = "23456789TJQKA"[rank] ?? "?";
    const suitChar = ["s", "h", "d", "c"][suit] ?? "?";
    return `${rankChar}${suitChar}`;
  };

  const data: CombinedEntry[] = [];
  let heroEntry: CombinedEntry | null = null;

  for (let i = 0; i < records; i += 1) {
    const base = i * 14;
    const chunk = out.subarray(base, base + 14);
    const raw1 = chunk[0];
    const raw2 = chunk[1];
    const card1 = decodeCard(raw1);
    const card2 = decodeCard(raw2);
    const heroWins = chunk[2];
    const ties = chunk[3];
    const plays = chunk[4];
    const rankCounts = chunk.subarray(5, 14);
    const resultsObject = {} as RankResults;
    for (let r = 0; r < labels.length; r += 1) {
      resultsObject[labels[r]] = rankCounts[r] ?? 0;
    }

    const isHero = raw1 === 0xffffffff && raw2 === 0xffffffff;
    if (isHero) {
      heroEntry = {
        hand: heroTrimmed,
        count: plays,
        win: heroWins,
        tie: ties,
        results: resultsObject,
      };
    } else {
      const oppWins = Math.max(0, plays - heroWins - ties);
      data.push({
        hand: handList[i] ?? `${card1} ${card2}`,
        count: plays,
        win: oppWins,
        tie: ties,
        results: resultsObject,
      });
    }
  }

  if (!heroEntry) {
    throw new Error("Hero aggregate record missing from WASM output");
  }

  data.push(heroEntry);

  data.sort(
    (a, b) => (b.win + b.tie / 2) / b.count - (a.win + a.tie / 2) / a.count,
  );

  const equity =
    heroEntry.count === 0
      ? 0
      : (heroEntry.win + heroEntry.tie * 0.5) / heroEntry.count;

  const end = performance.now(); // For performance measurement
  console.log(`runSimulateVsListWithRanks took ${end - start} ms`); // Log the time taken

  return {
    hand: heroTrimmed,
    equity,
    data,
  };
}

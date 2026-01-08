const DEFAULT_WASM_URL = "/wasm/rust_wasm_bg.wasm";
const PAGE_SIZE = 64 * 1024; // WebAssembly page size in bytes
const HEAP_START = 1024; // simple bump allocator starting offset

type WasmExports = {
  memory: WebAssembly.Memory;
  simulate_rank_distribution?: (
    handsPtr: number,
    handsLen: number,
    boardPtr: number,
    boardLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_vs_list_with_ranks?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
  simulate_vs_list_with_ranks_with_progress?: (
    heroPtr: number,
    heroLen: number,
    boardPtr: number,
    boardLen: number,
    comparePtr: number,
    compareLen: number,
    trials: number,
    seed: bigint,
    outPtr: number,
    outLen: number,
  ) => number;
};

type RankResults = {
  "High Card": number;
  "One Pair": number;
  "Two Pair": number;
  "Three of a Kind": number;
  Straight: number;
  Flush: number;
  "Full House": number;
  "Four of a Kind": number;
  "Straight Flush": number;
};

type CombinedEntry = {
  hand: string;
  count: number;
  win: number;
  tie: number;
  results: RankResults;
};

type CombinedPayload = {
  hand: string;
  equity: number;
  data: CombinedEntry[];
};

type SimulateParams = {
  hero: string[];
  board: string[];
  compare: string[][];
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
};

type RankDistributionParams = {
  hands: string[][];
  board: string[];
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
};

type RankDistributionEntry = {
  hand: string;
  results: RankResults;
};

type SimulateWithProgressParams = SimulateParams & {
  onProgress?: (pct: number) => void;
};

const encoder = new TextEncoder();

let progressListener: ((pct: number) => void) | null = null;
let wasmInstancePromise: Promise<{
  exports: WasmExports;
  memory: WebAssembly.Memory;
}> | null = null;

async function loadWasm(wasmUrl: string): Promise<{
  exports: WasmExports;
  memory: WebAssembly.Memory;
}> {
  if (wasmInstancePromise) return wasmInstancePromise;

  wasmInstancePromise = (async () => {
    const res = await fetch(wasmUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch WASM: ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    const imports = {
      env: {
        report_progress(progress: number) {
          progressListener?.(progress);
        },
      },
    };
    const { instance } = await WebAssembly.instantiate(buffer, imports);
    const exports = instance.exports as WebAssembly.Exports;
    const memory = (exports as Record<string, unknown>).memory;
    if (!(memory instanceof WebAssembly.Memory)) {
      throw new Error("WASM export 'memory' not found");
    }
    return { exports: exports as WasmExports, memory };
  })();

  return wasmInstancePromise;
}

function ensureCapacity(memory: WebAssembly.Memory, needed: number) {
  const current = memory.buffer.byteLength;
  if (needed <= current) return;
  const extra = needed - current;
  const pages = Math.ceil(extra / PAGE_SIZE);
  memory.grow(pages);
}

async function simulateVsListWithRanks({
  hero,
  board,
  compare,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: SimulateParams): Promise<CombinedPayload> {
  return runSimulateVsListWithRanks(
    {
      hero,
      board,
      compare,
      trials,
      seed,
      wasmUrl,
    },
    {},
  );
}

async function simulateVsListWithRanksWithProgress({
  onProgress,
  ...params
}: SimulateWithProgressParams): Promise<CombinedPayload> {
  return runSimulateVsListWithRanks(params, {
    onProgress,
    useProgressExport: true,
  });
}

async function runSimulateVsListWithRanks(
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
  )
    return new Promise<CombinedPayload>((resolve) => {
      resolve({
        hand: heroStr,
        equity: 0,
        data: [],
      });
    });

  await new Promise((resolve) => setTimeout(resolve, 500)); // Yield to avoid blocking UI
  const startTime = performance.now();
  const heroTrimmed = heroStr.trim();
  const boardTrimmed = boardStr.trim();
  const compareTrimmed = compareStr.trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  const wantsProgress = useProgressExport || typeof onProgress === "function";
  const simulate =
    wantsProgress &&
    typeof exports.simulate_vs_list_with_ranks_with_progress === "function"
      ? exports.simulate_vs_list_with_ranks_with_progress
      : exports.simulate_vs_list_with_ranks;
  if (typeof simulate !== "function") {
    const missing = wantsProgress
      ? "simulate_vs_list_with_ranks_with_progress"
      : "simulate_vs_list_with_ranks";
    throw new Error(`WASM export '${missing}' not found`);
  }

  let heap = HEAP_START;
  const viewU8 = () => new Uint8Array(memory.buffer);
  const align4 = () => {
    const mod = heap & 3;
    if (mod !== 0) {
      heap += 4 - mod;
    }
  };
  const writeString = (text: string) => {
    const bytes = encoder.encode(text);
    const ptr = heap;
    heap += bytes.length;
    ensureCapacity(memory, heap);
    viewU8().set(bytes, ptr);
    return { ptr, len: bytes.length };
  };

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
  align4();
  const outPtr = heap;
  heap += outLen * 4;
  ensureCapacity(memory, heap);

  let rc: number;
  progressListener = onProgress ?? null;
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
    progressListener = null;
  }
  if (rc < 0) {
    throw new Error(`simulate_vs_list_with_ranks failed with code ${rc}`);
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

  const endTime = performance.now();
  console.log(
    `simulateVsListWithRanks completed in ${(endTime - startTime).toFixed(
      2,
    )} ms`,
  );

  return {
    hand: heroTrimmed,
    equity,
    data,
  };
}

async function simulateRankDistribution({
  hands,
  board,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: RankDistributionParams): Promise<RankDistributionEntry[]> {
  const handsTrimmed = hands
    .map((hand) => hand.join(" ").trim())
    .filter(Boolean);
  const handsStr = handsTrimmed.join("; ");
  const boardStr = board.join(" ");

  if (handsTrimmed.length === 0 || board.length < 3 || board.length > 5) {
    return [];
  }

  await new Promise((resolve) => setTimeout(resolve, 300));
  const { exports, memory } = await loadWasm(wasmUrl);
  const simulate = exports.simulate_rank_distribution;
  if (typeof simulate !== "function") {
    throw new Error("WASM export 'simulate_rank_distribution' not found");
  }

  let heap = HEAP_START;
  const viewU8 = () => new Uint8Array(memory.buffer);
  const align4 = () => {
    const mod = heap & 3;
    if (mod !== 0) {
      heap += 4 - mod;
    }
  };
  const writeString = (text: string) => {
    const bytes = encoder.encode(text);
    const ptr = heap;
    heap += bytes.length;
    ensureCapacity(memory, heap);
    viewU8().set(bytes, ptr);
    return { ptr, len: bytes.length };
  };

  const handsBuf = writeString(handsStr);
  const boardBuf = writeString(boardStr);

  const outLen = handsTrimmed.length * 9;
  align4();
  const outPtr = heap;
  heap += outLen * 4;
  ensureCapacity(memory, heap);

  const rc = simulate(
    handsBuf.ptr,
    handsBuf.len,
    boardBuf.ptr,
    boardBuf.len,
    trials,
    seed,
    outPtr,
    outLen,
  );
  if (rc < 0) {
    throw new Error(`simulate_rank_distribution failed with code ${rc}`);
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

export {
  simulateVsListWithRanks,
  simulateVsListWithRanksWithProgress,
  simulateRankDistribution,
};
export type { CombinedPayload, RankDistributionEntry };

const DEFAULT_WASM_URL = "/wasm/rust_wasm_bg.wasm";
const PAGE_SIZE = 64 * 1024; // WebAssembly page size in bytes
const HEAP_START = 1024; // simple bump allocator starting offset

type WasmExports = {
  memory: WebAssembly.Memory;
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

const encoder = new TextEncoder();

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
    const { instance } = await WebAssembly.instantiate(buffer);
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
}: {
  hero: string;
  board: string;
  compare: string;
  trials: number;
  seed?: bigint;
  wasmUrl?: string;
}): Promise<CombinedPayload> {
  const startTime = performance.now();
  const heroTrimmed = hero.trim();
  const boardTrimmed = board.trim();
  const compareTrimmed = compare.trim();

  const { exports, memory } = await loadWasm(wasmUrl);
  if (typeof exports.simulate_vs_list_with_ranks !== "function") {
    throw new Error("WASM export 'simulate_vs_list_with_ranks' not found");
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

  const rc = exports.simulate_vs_list_with_ranks(
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

export { simulateVsListWithRanks };
export type { CombinedPayload };

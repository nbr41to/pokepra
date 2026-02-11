import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm, setProgressListener } from "../loader";
import type {
  MultiHandEquityEntry,
  MultiHandEquityParams,
  MultiHandEquityPayload,
} from "../types";

const SCALE = 1_000_000;

export async function runSimulateMultiHandEquity(
  {
    hands,
    board,
    trials,
    seed = 123456789n,
    wasmUrl = DEFAULT_WASM_URL,
  }: MultiHandEquityParams,
  {
    onProgress,
    useProgressExport = false,
  }: { onProgress?: (pct: number) => void; useProgressExport?: boolean } = {},
): Promise<MultiHandEquityPayload> {
  const handsTrimmed = hands
    .map((hand) => hand.join(" ").trim())
    .filter(Boolean);
  const boardStr = board.join(" ");

  if (handsTrimmed.length < 2 || handsTrimmed.length > 6 || board.length > 5) {
    return { data: [] };
  }

  const { exports, memory } = await loadWasm(wasmUrl);
  const wantsProgress =
    typeof onProgress === "function" && useProgressExport !== false;
  const simulate = wantsProgress
    ? exports.simulate_multi_hand_equity_with_progress
    : exports.simulate_multi_hand_equity;
  if (typeof simulate !== "function") {
    const missing = wantsProgress
      ? "simulate_multi_hand_equity_with_progress"
      : "simulate_multi_hand_equity";
    throw new Error(`WASM export '${missing}' not found`);
  }

  const { writeString, allocU32 } = createHeap(memory);
  const handsBuf = writeString(handsTrimmed.join("; "));
  const boardBuf = writeString(boardStr);

  const outLen = handsTrimmed.length * 3;
  const outPtr = allocU32(outLen);

  let rc: number;
  setProgressListener(wantsProgress ? (onProgress ?? null) : null);
  try {
    rc = simulate(
      handsBuf.ptr,
      handsBuf.len,
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
        ? `simulate_multi_hand_equity_with_progress failed with code ${rc}`
        : `simulate_multi_hand_equity failed with code ${rc}`,
    );
  }
  if (rc === 0) {
    return { data: [] };
  }

  const out = new Uint32Array(memory.buffer, outPtr, rc * 3);
  const data: MultiHandEquityEntry[] = [];
  for (let i = 0; i < rc; i += 1) {
    const base = i * 3;
    data.push({
      hand: handsTrimmed[i] ?? "",
      equity: (out[base + 2] ?? 0) / SCALE,
    });
  }

  return { data };
}

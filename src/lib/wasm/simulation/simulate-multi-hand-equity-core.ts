import { DEFAULT_WASM_URL } from "../constants";
import { createHeap, loadWasm } from "../loader";
import type {
  MultiHandEquityEntry,
  MultiHandEquityParams,
  MultiHandEquityPayload,
} from "../types";

const SCALE = 1_000_000;

export async function runSimulateMultiHandEquity({
  hands,
  board,
  trials,
  seed = 123456789n,
  wasmUrl = DEFAULT_WASM_URL,
}: MultiHandEquityParams): Promise<MultiHandEquityPayload> {
  const handsTrimmed = hands
    .map((hand) => hand.join(" ").trim())
    .filter(Boolean);
  const boardStr = board.join(" ");

  if (handsTrimmed.length < 3 || handsTrimmed.length > 6 || board.length > 5) {
    return { data: [] };
  }

  const { exports, memory } = await loadWasm(wasmUrl);
  const simulate = exports.simulate_multi_hand_equity;
  if (typeof simulate !== "function") {
    throw new Error("WASM export 'simulate_multi_hand_equity' not found");
  }

  const { writeString, allocU32 } = createHeap(memory);
  const handsBuf = writeString(handsTrimmed.join("; "));
  const boardBuf = writeString(boardStr);

  const outLen = handsTrimmed.length * 3;
  const outPtr = allocU32(outLen);

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
    throw new Error(`simulate_multi_hand_equity failed with code ${rc}`);
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

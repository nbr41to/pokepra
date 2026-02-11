import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { OpenRangesParams, OpenRangesPayload } from "../types";

export async function simulateOpenRangesMonteCarlo(
  params: OpenRangesParams,
): Promise<OpenRangesPayload> {
  const request = {
    type: "simulateOpenRangesMonteCarlo",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<OpenRangesPayload>(request);
}

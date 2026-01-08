import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "./constants";
import type { CombinedPayload, SimulateParams } from "./types";

export async function simulateVsListWithRanksMonteCarlo(
  params: SimulateParams,
): Promise<CombinedPayload> {
  const request = {
    type: "simulateVsListWithRanksMonteCarlo",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<CombinedPayload>(request);
}

import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "./constants";
import type {
  CombinedPayload,
  SimulateParams,
  SimulateWithProgressParams,
} from "./types";

export async function simulateVsListWithRanks(params: SimulateParams) {
  const request = {
    type: "simulateVsListWithRanks",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<CombinedPayload>(request);
}

export async function simulateVsListWithRanksWithProgress(
  params: SimulateWithProgressParams,
): Promise<CombinedPayload> {
  const { onProgress, ...rest } = params;
  const request = {
    type: "simulateVsListWithRanksWithProgress",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(rest.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<CombinedPayload>(request, { onProgress });
}

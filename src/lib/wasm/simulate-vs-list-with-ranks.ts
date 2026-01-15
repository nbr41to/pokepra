import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "./constants";
import type {
  CombinedPayload,
  MonteCarloTraceEntry,
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

export async function simulateVsListWithRanksTrace(
  params: SimulateParams,
): Promise<MonteCarloTraceEntry[]> {
  const request = {
    type: "simulateVsListWithRanksTrace",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<MonteCarloTraceEntry[]>(request);
}

import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type {
  CombinedPayload,
  MonteCarloTraceEntry,
  SimulateParams,
} from "../types";

type SimulateParamsWithOptionalProgress = SimulateParams & {
  onProgress?: (pct: number) => void;
};

const runSimulateVsListWithRanks = async (
  params: SimulateParamsWithOptionalProgress,
): Promise<CombinedPayload> => {
  const { onProgress, wasmUrl, ...rest } = params;
  const wantsProgress = typeof onProgress === "function";
  const request = {
    type: wantsProgress
      ? "simulateVsListWithRanksWithProgress"
      : "simulateVsListWithRanks",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<CombinedPayload>(
    request,
    wantsProgress ? { onProgress } : undefined,
  );
};

export async function simulateVsListWithRanks(
  params: SimulateParamsWithOptionalProgress,
) {
  return runSimulateVsListWithRanks(params);
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

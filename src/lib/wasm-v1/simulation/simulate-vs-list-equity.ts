import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { EquityPayload, SimulateParams } from "../types";

type SimulateParamsWithOptionalProgress = SimulateParams & {
  onProgress?: (pct: number) => void;
};

const runSimulateVsListEquity = async (
  params: SimulateParamsWithOptionalProgress,
): Promise<EquityPayload> => {
  const { onProgress, wasmUrl, ...rest } = params;
  const wantsProgress = typeof onProgress === "function";
  const request = {
    type: wantsProgress
      ? "simulateVsListEquityWithProgress"
      : "simulateVsListEquity",
    params: {
      ...rest,
      ...(wantsProgress ? { useProgressExport: true } : {}),
      wasmUrl: resolveWorkerWasmUrl(wasmUrl, DEFAULT_WASM_URL),
    },
  };

  return runWorkerRequest<EquityPayload>(
    request,
    wantsProgress ? { onProgress } : undefined,
  );
};

export async function simulateVsListEquity(
  params: SimulateParamsWithOptionalProgress,
): Promise<EquityPayload> {
  return runSimulateVsListEquity(params);
}

import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { RangeVsRangeParams, RangeVsRangePayload } from "../types";

type RangeVsRangeParamsWithOptionalProgress = RangeVsRangeParams & {
  onProgress?: (pct: number) => void;
};

const runSimulateRangeVsRangeEquity = async (
  params: RangeVsRangeParamsWithOptionalProgress,
): Promise<RangeVsRangePayload> => {
  const { onProgress, wasmUrl, ...rest } = params;
  const wantsProgress = typeof onProgress === "function";
  const request = {
    type: wantsProgress
      ? "simulateRangeVsRangeEquityWithProgress"
      : "simulateRangeVsRangeEquity",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(wasmUrl, DEFAULT_WASM_URL),
    },
  } as const;

  return runWorkerRequest<RangeVsRangePayload>(
    request,
    wantsProgress ? { onProgress } : undefined,
  );
};

export async function simulateRangeVsRangeEquity(
  params: RangeVsRangeParamsWithOptionalProgress,
): Promise<RangeVsRangePayload> {
  return runSimulateRangeVsRangeEquity(params);
}

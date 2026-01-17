import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type {
  RangeVsRangeParams,
  RangeVsRangePayload,
  RangeVsRangeWithProgressParams,
} from "../types";

export async function simulateRangeVsRangeEquity(
  params: RangeVsRangeParams,
): Promise<RangeVsRangePayload> {
  const request = {
    type: "simulateRangeVsRangeEquity",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  } as const;

  return runWorkerRequest<RangeVsRangePayload>(request);
}

export async function simulateRangeVsRangeEquityWithProgress(
  params: RangeVsRangeWithProgressParams,
): Promise<RangeVsRangePayload> {
  const { onProgress, ...rest } = params;
  const request = {
    type: "simulateRangeVsRangeEquityWithProgress",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  } as const;

  return runWorkerRequest<RangeVsRangePayload>(request, { onProgress });
}

import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type {
  OpenRangesParams,
  OpenRangesPayload,
  OpenRangesWithProgressParams,
} from "../types";

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

export async function simulateOpenRangesMonteCarloWithProgress(
  params: OpenRangesWithProgressParams,
): Promise<OpenRangesPayload> {
  const { onProgress, ...rest } = params;
  const request = {
    type: "simulateOpenRangesMonteCarlo",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(rest.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<OpenRangesPayload>(request, { onProgress });
}

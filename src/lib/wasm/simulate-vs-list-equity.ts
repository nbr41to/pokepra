import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "./constants";
import type {
  EquityPayload,
  SimulateParams,
  SimulateWithProgressParams,
} from "./types";

export async function simulateVsListEquity(
  params: SimulateParams,
): Promise<EquityPayload> {
  const request = {
    type: "simulateVsListEquity",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };

  return runWorkerRequest<EquityPayload>(request);
}

export async function simulateVsListEquityWithProgress(
  params: SimulateWithProgressParams,
): Promise<EquityPayload> {
  const { onProgress, ...rest } = params;
  const request = {
    type: "simulateVsListEquityWithProgress",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(rest.wasmUrl, DEFAULT_WASM_URL),
    },
  };

  return runWorkerRequest<EquityPayload>(request, { onProgress });
}

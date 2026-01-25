import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type {
  MultiHandEquityParams,
  MultiHandEquityPayload,
  MultiHandEquityWithProgressParams,
} from "../types";

export async function simulateMultiHandEquity(
  params: MultiHandEquityParams,
): Promise<MultiHandEquityPayload> {
  const request = {
    type: "simulateMultiHandEquity",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };

  return runWorkerRequest<MultiHandEquityPayload>(request);
}

export async function simulateMultiHandEquityWithProgress(
  params: MultiHandEquityWithProgressParams,
): Promise<MultiHandEquityPayload> {
  const { onProgress, ...rest } = params;
  const request = {
    type: "simulateMultiHandEquityWithProgress",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(rest.wasmUrl, DEFAULT_WASM_URL),
    },
  };

  return runWorkerRequest<MultiHandEquityPayload>(request, { onProgress });
}

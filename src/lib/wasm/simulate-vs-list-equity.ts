import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "./constants";
import type { EquityPayload, SimulateParams } from "./types";

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

import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { MultiHandEquityParams, MultiHandEquityPayload } from "../types";

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

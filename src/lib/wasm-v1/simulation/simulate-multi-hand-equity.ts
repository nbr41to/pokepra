import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { MultiHandEquityParams, MultiHandEquityPayload } from "../types";

type MultiHandEquityParamsWithOptionalProgress = MultiHandEquityParams & {
  onProgress?: (pct: number) => void;
};

const runSimulateMultiHandEquity = async (
  params: MultiHandEquityParamsWithOptionalProgress,
): Promise<MultiHandEquityPayload> => {
  const { onProgress, wasmUrl, ...rest } = params;
  const wantsProgress = typeof onProgress === "function";
  const request = {
    type: wantsProgress
      ? "simulateMultiHandEquityWithProgress"
      : "simulateMultiHandEquity",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(wasmUrl, DEFAULT_WASM_URL),
    },
  };

  return runWorkerRequest<MultiHandEquityPayload>(
    request,
    wantsProgress ? { onProgress } : undefined,
  );
};

export async function simulateMultiHandEquity(
  params: MultiHandEquityParamsWithOptionalProgress,
): Promise<MultiHandEquityPayload> {
  return runSimulateMultiHandEquity(params);
}

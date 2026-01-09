import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "./constants";
import type {
  RankDistributionEntry,
  RankDistributionParams,
  RankDistributionWithProgressParams,
} from "./types";

export async function simulateRankDistribution(params: RankDistributionParams) {
  const request = {
    type: "simulateRankDistribution",
    params: {
      ...params,
      wasmUrl: resolveWorkerWasmUrl(params.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<RankDistributionEntry[]>(request);
}

export async function simulateRankDistributionWithProgress(
  params: RankDistributionWithProgressParams,
): Promise<RankDistributionEntry[]> {
  const { onProgress, ...rest } = params;
  const request = {
    type: "simulateRankDistributionWithProgress",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(rest.wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<RankDistributionEntry[]>(request, { onProgress });
}

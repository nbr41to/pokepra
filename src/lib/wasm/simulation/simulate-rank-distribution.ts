import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { RankDistributionEntry, RankDistributionParams } from "../types";

type RankDistributionParamsWithOptionalProgress = RankDistributionParams & {
  onProgress?: (pct: number) => void;
};

const runSimulateRankDistribution = async (
  params: RankDistributionParamsWithOptionalProgress,
): Promise<RankDistributionEntry[]> => {
  const { onProgress, wasmUrl, ...rest } = params;
  const wantsProgress = typeof onProgress === "function";
  const request = {
    type: wantsProgress
      ? "simulateRankDistributionWithProgress"
      : "simulateRankDistribution",
    params: {
      ...rest,
      wasmUrl: resolveWorkerWasmUrl(wasmUrl, DEFAULT_WASM_URL),
    },
  };
  return runWorkerRequest<RankDistributionEntry[]>(
    request,
    wantsProgress ? { onProgress } : undefined,
  );
};

export async function simulateRankDistribution(
  params: RankDistributionParamsWithOptionalProgress,
) {
  return runSimulateRankDistribution(params);
}

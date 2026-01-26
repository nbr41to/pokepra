import {
  resolveWorkerWasmUrl,
  runWorkerRequest,
} from "@/lib/worker/wasm-worker-client";
import { DEFAULT_WASM_URL } from "../constants";
import type { RangeVsRangeParams, RangeVsRangePayload } from "../types";

type RangeVsRangeParamsWithOptionalProgress = RangeVsRangeParams & {
  onProgress?: (pct: number) => void;
};

const normalizeRangeInput = (range: RangeVsRangeParams["heroRange"]) => {
  if (Array.isArray(range)) {
    return range
      .map((hand) => hand.join("").trim())
      .filter(Boolean)
      .join(",");
  }
  return range;
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
      heroRange: normalizeRangeInput(rest.heroRange),
      villainRange: normalizeRangeInput(rest.villainRange),
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

/// <reference lib="webworker" />

import { runSimulateVsListEquity } from "./simulate-vs-list-equity-core";
import { runSimulateVsListWithRanks } from "./simulate-vs-list-with-ranks-core";
import { runSimulateVsListWithRanksMonteCarlo } from "./simulate-vs-list-with-ranks-monte-carlo-core";
import type { CombinedPayload, EquityPayload, SimulateParams } from "./types";

type SimulateResult = CombinedPayload | EquityPayload;

type WorkerRequest =
  | { id: number; type: "simulateVsListWithRanks"; params: SimulateParams }
  | { id: number; type: "simulateVsListWithRanksMonteCarlo"; params: SimulateParams }
  | { id: number; type: "simulateVsListEquity"; params: SimulateParams }
  | {
      id: number;
      type: "simulateVsListWithRanksWithProgress";
      params: SimulateParams;
    };

type WorkerResponse =
  | { id: number; type: "result"; data: SimulateResult }
  | { id: number; type: "progress"; pct: number }
  | { id: number; type: "error"; error: string };

const ctx: DedicatedWorkerGlobalScope =
  self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event) => {
  const message = event.data as WorkerRequest | undefined;
  if (!message) return;

  try {
    if (message.type === "simulateVsListWithRanksWithProgress") {
      const data = await runSimulateVsListWithRanks(
        {
          ...message.params,
        },
        {
          useProgressExport: true,
          onProgress: (pct) => {
            const response: WorkerResponse = {
              id: message.id,
              type: "progress",
              pct,
            };
            ctx.postMessage(response);
          },
        },
      );
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateVsListWithRanks") {
      const data = await runSimulateVsListWithRanks(message.params, {});
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateVsListWithRanksMonteCarlo") {
      const data = await runSimulateVsListWithRanksMonteCarlo(message.params);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateVsListEquity") {
      const data = await runSimulateVsListEquity(message.params);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse = {
      id: message.id,
      type: "error",
      error: error instanceof Error ? error.message : "Worker error",
    };
    ctx.postMessage(response);
  }
};

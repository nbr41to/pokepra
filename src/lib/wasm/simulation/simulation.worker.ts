/// <reference lib="webworker" />

import type {
  CombinedPayload,
  EquityPayload,
  MonteCarloTraceEntry,
  MultiHandEquityParams,
  MultiHandEquityPayload,
  OpenRangesParams,
  OpenRangesPayload,
  RangeVsRangeParams,
  RangeVsRangePayload,
  RankDistributionEntry,
  RankDistributionParams,
  SimulateParams,
} from "../types";
import { runSimulateMultiHandEquity } from "./simulate-multi-hand-equity-core";
import { runSimulateOpenRangesMonteCarlo } from "./simulate-open-ranges-monte-carlo-core";
import { runSimulateRangeVsRangeEquity } from "./simulate-range-vs-range-equity-core";
import { runSimulateRankDistribution } from "./simulate-rank-distribution-core";
import { runSimulateVsListEquity } from "./simulate-vs-list-equity-core";
import { runSimulateVsListWithRanks } from "./simulate-vs-list-with-ranks-core";
import { runSimulateVsListWithRanksTrace } from "./simulate-vs-list-with-ranks-trace-core";

type SimulateResult =
  | CombinedPayload
  | EquityPayload
  | OpenRangesPayload
  | RangeVsRangePayload
  | MultiHandEquityPayload
  | RankDistributionEntry[]
  | MonteCarloTraceEntry[];

type SimulateWorkerParams = SimulateParams & { useProgressExport?: boolean };

type WorkerRequest =
  | { id: number; type: "simulateVsListWithRanks"; params: SimulateParams }
  | {
      id: number;
      type: "simulateVsListWithRanksMonteCarlo";
      params: SimulateParams;
    }
  | { id: number; type: "simulateVsListWithRanksTrace"; params: SimulateParams }
  | { id: number; type: "simulateVsListEquity"; params: SimulateWorkerParams }
  | {
      id: number;
      type: "simulateMultiHandEquity";
      params: MultiHandEquityParams;
    }
  | {
      id: number;
      type: "simulateMultiHandEquityWithProgress";
      params: MultiHandEquityParams;
    }
  | {
      id: number;
      type: "simulateVsListEquityWithProgress";
      params: SimulateWorkerParams;
    }
  | {
      id: number;
      type: "simulateRankDistribution";
      params: RankDistributionParams;
    }
  | {
      id: number;
      type: "simulateRankDistributionWithProgress";
      params: RankDistributionParams;
    }
  | {
      id: number;
      type: "simulateVsListWithRanksWithProgress";
      params: SimulateParams;
    }
  | {
      id: number;
      type: "simulateRangeVsRangeEquity";
      params: RangeVsRangeParams;
    }
  | {
      id: number;
      type: "simulateRangeVsRangeEquityWithProgress";
      params: RangeVsRangeParams;
    }
  | {
      id: number;
      type: "simulateOpenRangesMonteCarlo";
      params: OpenRangesParams;
    };

type WorkerResponse =
  | { id: number; type: "result"; data: SimulateResult }
  | { id: number; type: "progress"; pct: number }
  | { id: number; type: "error"; error: string };

const ctx: DedicatedWorkerGlobalScope =
  self as unknown as DedicatedWorkerGlobalScope;

const createRandomSeed = () =>
  (BigInt(Date.now()) << 16n) ^ BigInt(Math.floor(Math.random() * 0xffff));

ctx.onmessage = async (event) => {
  const message = event.data as WorkerRequest | undefined;
  if (!message) return;

  try {
    if (message.type === "simulateVsListWithRanksWithProgress") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateVsListWithRanks(
        {
          ...params,
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
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateVsListWithRanks(params, {});
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateVsListWithRanksTrace") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateVsListWithRanksTrace(params);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateVsListEquity") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const { useProgressExport: _ignored, ...rest } = params;
      const data = await runSimulateVsListEquity(rest);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateMultiHandEquity") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateMultiHandEquity(params);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateMultiHandEquityWithProgress") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateMultiHandEquity(params, {
        useProgressExport: true,
        onProgress: (pct) => {
          const response: WorkerResponse = {
            id: message.id,
            type: "progress",
            pct,
          };
          ctx.postMessage(response);
        },
      });
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateVsListEquityWithProgress") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const { useProgressExport, ...rest } = params;
      const progressEnabled = Boolean(useProgressExport);
      const data = await runSimulateVsListEquity(rest, {
        useProgressExport: progressEnabled,
        onProgress: progressEnabled
          ? (pct) => {
              const response: WorkerResponse = {
                id: message.id,
                type: "progress",
                pct,
              };
              ctx.postMessage(response);
            }
          : undefined,
      });
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateRankDistributionWithProgress") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateRankDistribution(params, {
        useProgressExport: true,
        onProgress: (pct) => {
          const response: WorkerResponse = {
            id: message.id,
            type: "progress",
            pct,
          };
          ctx.postMessage(response);
        },
      });
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateRankDistribution") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateRankDistribution(params, {});
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateRangeVsRangeEquity") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateRangeVsRangeEquity(params);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateRangeVsRangeEquityWithProgress") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const data = await runSimulateRangeVsRangeEquity({
        ...params,
        onProgress: (pct) => {
          const response: WorkerResponse = {
            id: message.id,
            type: "progress",
            pct,
          };
          ctx.postMessage(response);
        },
      });
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
    }
    if (message.type === "simulateOpenRangesMonteCarlo") {
      const params =
        message.params.seed === undefined
          ? { ...message.params, seed: createRandomSeed() }
          : message.params;
      const progressStart: WorkerResponse = {
        id: message.id,
        type: "progress",
        pct: 0,
      };
      ctx.postMessage(progressStart);
      const data = await runSimulateOpenRangesMonteCarlo(params);
      const progressEnd: WorkerResponse = {
        id: message.id,
        type: "progress",
        pct: 100,
      };
      ctx.postMessage(progressEnd);
      const response: WorkerResponse = { id: message.id, type: "result", data };
      ctx.postMessage(response);
      return;
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

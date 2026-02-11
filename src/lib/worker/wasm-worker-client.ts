type WorkerResponse<T> =
  | { id: number; type: "result"; data: T }
  | { id: number; type: "progress"; pct: number }
  | { id: number; type: "error"; error: string };

type PendingEntry<T> = {
  resolve: (data: T) => void;
  reject: (error: Error) => void;
  onProgress?: (pct: number) => void;
};

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, PendingEntry<unknown>>();

const handleMessage = (event: MessageEvent<WorkerResponse<unknown>>) => {
  const message = event.data;
  if (message.type === "progress") {
    const entry = pending.get(message.id);
    entry?.onProgress?.(message.pct);
    return;
  }
  const entry = pending.get(message.id);
  if (!entry) return;
  pending.delete(message.id);
  if (message.type === "result") {
    entry.resolve(message.data);
  } else {
    entry.reject(new Error(message.error));
  }
};

const handleError = () => {
  for (const entry of pending.values()) {
    (entry as PendingEntry<unknown>).reject(new Error("WASM worker error"));
  }
  pending.clear();
};

const isWorkerRuntime =
  typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

export const getWasmWorker = () => {
  if (typeof window === "undefined" || isWorkerRuntime) {
    return null;
  }
  if (!worker) {
    worker = new Worker(
      new URL("../wasm-v1/simulation/simulation.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);
  }
  return worker;
};

export const resolveWorkerWasmUrl = (
  wasmUrl: string | undefined,
  fallback: string,
) => {
  if (typeof window === "undefined") {
    return wasmUrl || fallback;
  }
  return wasmUrl || new URL(fallback, window.location.origin).toString();
};

export const runWorkerRequest = async <T>(
  request: { type: string; params: unknown },
  options?: { onProgress?: (pct: number) => void },
): Promise<T> => {
  const activeWorker = getWasmWorker();
  if (!activeWorker) {
    throw new Error("Worker is not available in this runtime");
  }

  const id = seq + 1;
  seq = id;
  const payload = { id, ...request };

  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      resolve: resolve as (data: unknown) => void,
      reject,
      onProgress: options?.onProgress,
    });
    activeWorker.postMessage(payload);
  });
};

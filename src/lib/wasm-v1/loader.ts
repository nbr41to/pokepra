import { HEAP_START, PAGE_SIZE } from "./constants";
import type { WasmExports } from "./types";

const encoder = new TextEncoder();

let progressListener: ((pct: number) => void) | null = null;
let wasmMemory: WebAssembly.Memory | null = null;
let wasmInstancePromise: Promise<{
  exports: WasmExports;
  memory: WebAssembly.Memory;
}> | null = null;

const resolveWasmUrl = (url: string) => {
  if (/^(https?:|blob:|data:)/.test(url)) {
    return url;
  }
  try {
    if (typeof location !== "undefined" && location.origin !== "null") {
      return new URL(url, location.origin).toString();
    }
    if (typeof self !== "undefined" && "origin" in self) {
      const origin = (self as unknown as { origin?: string }).origin;
      if (origin && origin !== "null") {
        return new URL(url, origin).toString();
      }
    }
  } catch {
    // fall back to raw url
  }
  return url;
};

export const setProgressListener = (
  listener: ((pct: number) => void) | null,
) => {
  progressListener = listener;
};

export async function loadWasm(wasmUrl: string): Promise<{
  exports: WasmExports;
  memory: WebAssembly.Memory;
}> {
  if (wasmInstancePromise) return wasmInstancePromise;

  wasmInstancePromise = (async () => {
    const res = await fetch(resolveWasmUrl(wasmUrl));
    if (!res.ok) {
      throw new Error(`Failed to fetch WASM: ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    const imports = {
      env: {
        report_progress(progress: number) {
          progressListener?.(progress);
        },
        getrandom_fill(dest: number, len: number) {
          if (!wasmMemory) {
            return 1;
          }
          const view = new Uint8Array(wasmMemory.buffer, dest, len);
          const cryptoObj =
            typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
          if (cryptoObj?.getRandomValues) {
            cryptoObj.getRandomValues(view);
            return 0;
          }
          for (let i = 0; i < view.length; i += 1) {
            view[i] = Math.floor(Math.random() * 256);
          }
          return 0;
        },
      },
    };
    const { instance } = await WebAssembly.instantiate(buffer, imports);
    const exports = instance.exports as WebAssembly.Exports;
    const memory = (exports as Record<string, unknown>).memory;
    if (!(memory instanceof WebAssembly.Memory)) {
      throw new Error("WASM export 'memory' not found");
    }
    wasmMemory = memory;
    return { exports: exports as WasmExports, memory };
  })();

  return wasmInstancePromise;
}

export function ensureCapacity(memory: WebAssembly.Memory, needed: number) {
  const current = memory.buffer.byteLength;
  if (needed <= current) return;
  const extra = needed - current;
  const pages = Math.ceil(extra / PAGE_SIZE);
  memory.grow(pages);
}

export function createHeap(memory: WebAssembly.Memory) {
  let heap = HEAP_START;
  const viewU8 = () => new Uint8Array(memory.buffer);
  const align4 = () => {
    const mod = heap & 3;
    if (mod !== 0) {
      heap += 4 - mod;
    }
  };
  const writeString = (text: string) => {
    const bytes = encoder.encode(text);
    const ptr = heap;
    heap += bytes.length;
    ensureCapacity(memory, heap);
    viewU8().set(bytes, ptr);
    return { ptr, len: bytes.length };
  };
  const allocU32 = (count: number) => {
    align4();
    const ptr = heap;
    heap += count * 4;
    ensureCapacity(memory, heap);
    return ptr;
  };
  return { writeString, allocU32 };
}

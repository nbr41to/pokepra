import INITIAL_OPEN_RANGES from "@/data/initial-open-ranges.json";
import { normalizeRangeString } from "./hand-range";

const OPEN_RANGE_STORAGE_KEY = "mcpt:open-range-tables";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

const createMemoryStorage = (seed?: string): StorageLike => {
  const store = new Map<string, string>();
  if (seed) store.set(OPEN_RANGE_STORAGE_KEY, seed);
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
};

const resolveStorage = (storage?: StorageLike): StorageLike => {
  if (storage) return storage;
  if (typeof localStorage !== "undefined") return localStorage;
  return createMemoryStorage(JSON.stringify(INITIAL_OPEN_RANGES));
};

/**
 * Local Storageから設定されているOpen Rangeを取得する
 * @return string[][]
 */
function getSettingOpenRange(storage?: StorageLike): string[] {
  const resolved = resolveStorage(storage);
  let raw = resolved.getItem(OPEN_RANGE_STORAGE_KEY);

  if (!raw) {
    raw = JSON.stringify(INITIAL_OPEN_RANGES);
    resolved.setItem(OPEN_RANGE_STORAGE_KEY, raw);
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid stored open range format");
  }

  return (parsed as string[]).map(normalizeRangeString);
}

function createOpenRangeStorageMock(
  initial: string[] = INITIAL_OPEN_RANGES,
): StorageLike {
  return createMemoryStorage(JSON.stringify(initial));
}

export {
  getSettingOpenRange,
  createOpenRangeStorageMock,
  OPEN_RANGE_STORAGE_KEY,
};

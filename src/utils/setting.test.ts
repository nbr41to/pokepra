import { describe, expect, it } from "vitest";
import INITIAL_OPEN_RANGES from "@/data/initial-open-ranges.json";
import { normalizeRangeString } from "./hand-range";
import { createOpenRangeStorageMock, getSettingOpenRange } from "./setting";

describe("getSettingOpenRange", () => {
  it("INITIAL_OPEN_RANGES を使ったモックから正規化済みレンジを取得する", () => {
    const storage = createOpenRangeStorageMock(INITIAL_OPEN_RANGES);
    const result = getSettingOpenRange(storage);
    const expected = INITIAL_OPEN_RANGES.map(normalizeRangeString);
    expect(result).toEqual(expected);
  });

  it("独自レンジを指定したモックから正規化済みレンジを取得する", () => {
    const custom = ["QQ+,KQs-JTs,A5s+"];
    const storage = createOpenRangeStorageMock(custom);
    const result = getSettingOpenRange(storage);
    expect(result).toEqual(custom.map(normalizeRangeString));
  });
});

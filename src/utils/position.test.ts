import { afterEach, describe, expect, it, vi } from "bun:test";
import { genPositionNumber, getPositionLabel } from "./position";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("genPositionNumber", () => {
  it("maxPeopleが範囲外ならエラー", () => {
    expect(() => genPositionNumber(1)).toThrow();
    expect(() => genPositionNumber(10)).toThrow();
  });

  it("1〜maxPeopleの範囲で返す", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(genPositionNumber(9)).toBe(1);
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(genPositionNumber(9)).toBe(9);
  });
});

describe("getPositionLabel", () => {
  it("2人の場合の表記", () => {
    expect(getPositionLabel(1, 2)).toBe("BB");
    expect(getPositionLabel(2, 2)).toBe("BTN/SB");
  });

  it("3人以上の場合の表記", () => {
    expect(getPositionLabel(1, 9)).toBe("SB");
    expect(getPositionLabel(2, 9)).toBe("BB");
    expect(getPositionLabel(3, 9)).toBe("UTG");
    expect(getPositionLabel(9, 9)).toBe("BTN");
    expect(getPositionLabel(4, 9)).toBe("+1");
  });

  it("範囲外ならエラー", () => {
    expect(() => getPositionLabel(0, 9)).toThrow();
    expect(() => getPositionLabel(1, 10)).toThrow();
  });
});

import { describe, expect, it } from "bun:test";
import {
  getHandsInRange,
  getInitialHandRangeArray,
  getRangeStrengthByHand,
  getRangeStrengthByPosition,
  judgeInRange,
  toHandSymbol,
} from "./hand-range";

describe("toHandSymbol", () => {
  it("ペアはランク2文字を返す", () => {
    expect(toHandSymbol(["Ah", "As"])).toBe("AA");
  });

  it("スーテッド/オフスートを返す", () => {
    expect(toHandSymbol(["As", "Ks"])).toBe("AKs");
    expect(toHandSymbol("AsKh")).toBe("AKo");
  });
});

describe("getInitialHandRangeArray", () => {
  it("レンジの配列を返す", () => {
    const ranges = getInitialHandRangeArray();
    expect(ranges.length).toBeGreaterThan(0);
    expect(ranges[0]).toContain("AA");
  });
});

describe("getHandsInRange", () => {
  it("strengthが-1なら空配列", () => {
    expect(getHandsInRange(-1)).toEqual([]);
  });

  it("strengthが範囲外ならエラー", () => {
    expect(() => getHandsInRange(0)).toThrow();
    expect(() => getHandsInRange(99)).toThrow();
  });

  it("strength=1なら34通り", () => {
    const hands = getHandsInRange(1);
    expect(hands.length).toBe(34);
  });
});

describe("getRangeStrengthByHand", () => {
  it("レンジ内ならインデックスを返す", () => {
    expect(getRangeStrengthByHand("AsKh")).toBe(0);
  });

  it("レンジ外なら-1", () => {
    expect(getRangeStrengthByHand("7s2h")).toBe(-1);
  });
});

describe("getRangeStrengthByPosition", () => {
  it("範囲外なら-1", () => {
    expect(getRangeStrengthByPosition(1, 1)).toBe(-1);
    expect(getRangeStrengthByPosition(1, 10)).toBe(-1);
  });
  it("SBも-1", () => {
    expect(getRangeStrengthByPosition(1, 9)).toBe(-1);
  });

  it("ポジションに応じた強さを返す", () => {
    expect(getRangeStrengthByPosition(8, 9)).toBe(6);
    expect(getRangeStrengthByPosition(3, 9)).toBe(3); // UTG
  });
});

describe("judgeInRange", () => {
  it("レンジ内ならtrue", () => {
    expect(judgeInRange(["As", "Kh"], 3, 9)).toBe(true);
  });

  it("レンジ外ならfalse", () => {
    expect(judgeInRange(["7s", "2h"], 3, 9)).toBe(false);
  });
});

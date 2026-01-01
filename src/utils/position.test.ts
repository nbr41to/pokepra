import { describe, expect, it } from "bun:test";
import { genPositionNumber, getPositionString } from "./position";

describe("genPositionNumber", () => {
  it("maxPeople が範囲外なら例外", () => {
    expect(() => genPositionNumber(1)).toThrow();
    expect(() => genPositionNumber(10)).toThrow();
  });

  it("1..maxPeople の範囲で値を返す", () => {
    const maxPeople = 9;
    for (let i = 0; i < 200; i += 1) {
      const value = genPositionNumber(maxPeople);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(maxPeople);
    }
  });
});

describe("getPositionString", () => {
  it("maxPeople が範囲外なら例外", () => {
    expect(() => getPositionString(1, 1)).toThrow();
    expect(() => getPositionString(1, 10)).toThrow();
  });

  it("positionNumber が範囲外なら例外", () => {
    expect(() => getPositionString(0, 6)).toThrow();
    expect(() => getPositionString(7, 6)).toThrow();
  });

  it("9人テーブルでの対応を返す", () => {
    expect(getPositionString(1, 9)).toBe("UTG");
    expect(getPositionString(2, 9)).toBe("+1");
    expect(getPositionString(6, 9)).toBe("+5");
    expect(getPositionString(7, 9)).toBe("SB");
    expect(getPositionString(8, 9)).toBe("BB");
    expect(getPositionString(9, 9)).toBe("BTN");
  });

  it("ヘッズアップ(2人)での対応を返す", () => {
    expect(getPositionString(1, 2)).toBe("BB");
    expect(getPositionString(2, 2)).toBe("BTN\nSB");
  });
});

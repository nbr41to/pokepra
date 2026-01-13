import { afterEach, describe, expect, it, vi } from "bun:test";
import { genRandomInt, shuffleArray } from "./general";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("genRandomInt", () => {
  it("0以上max未満の整数を返す", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(genRandomInt(10)).toBe(9);
  });

  it("Math.randomが0なら0を返す", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(genRandomInt(10)).toBe(0);
  });
});

describe("shuffleArray", () => {
  it("元配列を変更せずシャッフルする", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const input = [1, 2, 3];
    const shuffled = shuffleArray(input);
    expect(input).toEqual([1, 2, 3]);
    expect(shuffled).toEqual([2, 3, 1]);
  });

  it("要素の集合は同じ", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const input = ["a", "b", "c", "d"];
    const shuffled = shuffleArray(input);
    expect(new Set(shuffled)).toEqual(new Set(input));
  });
});

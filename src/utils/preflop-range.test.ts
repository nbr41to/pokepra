import { describe, expect, it } from "bun:test";
import {
  getHandString,
  getSortedRank,
  getSuited,
  getTierIndexByPosition,
  judgeInRange,
} from "./preflop-range";

describe("getTierIndexByPosition", () => {
  it("範囲外なら -1 を返す", () => {
    expect(getTierIndexByPosition(-1)).toBe(-1);
    expect(getTierIndexByPosition(8)).toBe(-1);
  });

  it("ポジションごとのTier index を返す", () => {
    expect(getTierIndexByPosition(0)).toBe(3);
    expect(getTierIndexByPosition(1)).toBe(3);
    expect(getTierIndexByPosition(2)).toBe(4);
    expect(getTierIndexByPosition(3)).toBe(4);
    expect(getTierIndexByPosition(4)).toBe(5);
    expect(getTierIndexByPosition(5)).toBe(6);
    expect(getTierIndexByPosition(6)).toBe(7);
    expect(getTierIndexByPosition(7)).toBe(-1); // 配列外は -1
  });
});

describe("getSortedRank", () => {
  it("強いランクが先頭になるようソートする", () => {
    expect(getSortedRank("As", "Kd")).toBe("AK");
    expect(getSortedRank("2s", "Qd")).toBe("Q2");
    expect(getSortedRank("Jh", "Jc")).toBe("JJ");
  });
});

describe("getSuited", () => {
  it("同スートなら true、異なるスートなら false", () => {
    expect(getSuited("As", "Ks")).toBe(true);
    expect(getSuited("Ah", "Ks")).toBe(false);
  });
});

describe("getHandString", () => {
  it("ペアはランク2文字を返す", () => {
    expect(getHandString(["Ah", "As"])).toBe("AA");
    expect(getHandString(["2d", "2c"])).toBe("22");
  });

  it("スーテッドは末尾に s、オフスートは末尾に o を付ける", () => {
    expect(getHandString(["As", "Ks"])).toBe("AKs");
    expect(getHandString(["Ah", "Ks"])).toBe("AKo");
    expect(getHandString(["Td", "Jh"])).toBe("JTo");
  });
});

describe("judgeInRange", () => {
  it("範囲外ポジションでは常に false", () => {
    expect(judgeInRange(["As", "Ah"], -1)).toBe(false);
    expect(judgeInRange(["As", "Ah"], 8)).toBe(false);
  });

  it("Tier内のハンドなら true を返す", () => {
    // position 0 -> tierIndex 3 (Tier 1〜4 が対象)
    expect(judgeInRange(["As", "Kh"], 0)).toBe(true); // AKo は Tier1
    expect(judgeInRange(["6s", "6h"], 0)).toBe(true); // 66 は Tier4
  });

  it("Tier外のハンドなら false を返す", () => {
    // 72o はどの Tier にも含まれない
    expect(judgeInRange(["7s", "2h"], 0)).toBe(false);
    expect(judgeInRange(["7s", "2h"], 5)).toBe(false);
  });
});

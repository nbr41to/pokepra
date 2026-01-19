import { describe, expect, it } from "bun:test";
import {
  compressStartingHands,
  expandStartingHands,
  getHandsByStrength,
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

describe("getHandsByStrength", () => {
  it("strengthが-1なら空配列", () => {
    expect(getHandsByStrength(-1)).toEqual([]);
  });

  it("strengthが範囲外ならエラー", () => {
    expect(() => getHandsByStrength(0)).toThrow();
    expect(() => getHandsByStrength(99)).toThrow();
  });

  it("strength=1なら34通り", () => {
    const hands = getHandsByStrength(1);
    expect(hands.length).toBe(154);
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
  it("SBは強さを返す", () => {
    expect(getRangeStrengthByPosition(1, 9)).toBe(8);
  });

  it("ポジションに応じた強さを返す", () => {
    expect(getRangeStrengthByPosition(8, 9)).toBe(6);
    expect(getRangeStrengthByPosition(3, 9)).toBe(1); // UTG
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

describe("compressStartingHands", () => {
  it("連続したペアをプラス表記で圧縮する", () => {
    expect(compressStartingHands(["AA", "KK", "QQ"])).toBe("QQ+");
  });

  it("スーテッドコネクターのレンジをまとめる", () => {
    expect(compressStartingHands(["KQs", "QJs", "JTs"])).toBe("KQs-JTs");
  });

  it("Axsのプラス表記にまとめる", () => {
    expect(
      compressStartingHands([
        "AKs",
        "AQs",
        "AJs",
        "ATs",
        "A9s",
        "A8s",
        "A7s",
        "A6s",
        "A5s",
      ]),
    ).toBe("A5s+");
  });
});

describe("expandStartingHands", () => {
  it("プラス表記を展開する", () => {
    expect(expandStartingHands("QQ+")).toEqual(["QQ", "KK", "AA"]);
  });

  it("レンジ表記を展開する", () => {
    expect(expandStartingHands("KQs-JTs")).toEqual(["KQs", "QJs", "JTs"]);
  });

  it("Axsのプラス表記を展開する", () => {
    expect(expandStartingHands("A5s+")).toEqual([
      "AKs",
      "AQs",
      "AJs",
      "ATs",
      "A9s",
      "A8s",
      "A7s",
      "A6s",
      "A5s",
    ]);
  });
});

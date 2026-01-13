import { describe, expect, it } from "bun:test";
import {
  CARD_RANK_ORDER,
  CARD_RANKS,
  CARD_SUIT,
  CARD_SUITS,
  getAllCards,
  toHandArray,
  toHandString,
  toHandsArray,
  toHandsString,
} from "./card";

describe("CARD_RANKS", () => {
  it("Aから2の順で並んでいる", () => {
    expect(CARD_RANKS[0]).toBe("A");
    expect(CARD_RANKS.at(-1)).toBe("2");
  });
});

describe("CARD_RANK_ORDER", () => {
  it("Aが最大で2が最小", () => {
    expect(CARD_RANK_ORDER.A).toBe(14);
    expect(CARD_RANK_ORDER["2"]).toBe(2);
  });
});

describe("CARD_SUITS", () => {
  it("4スートが揃っている", () => {
    expect(CARD_SUITS).toEqual([
      CARD_SUIT.SPADE,
      CARD_SUIT.HEART,
      CARD_SUIT.DIAMOND,
      CARD_SUIT.CLUB,
    ]);
  });
});

describe("getAllCards", () => {
  it("52枚のカードを返す", () => {
    const cards = getAllCards();
    expect(cards.length).toBe(52);
  });

  it("重複がない", () => {
    const cards = getAllCards();
    const unique = new Set(cards);
    expect(unique.size).toBe(52);
  });

  it("代表的なカードが含まれる", () => {
    const cards = getAllCards();
    expect(cards).toContain("As");
    expect(cards).toContain("Kd");
    expect(cards).toContain("2c");
  });
});

describe("toHandArray", () => {
  it("2枚を配列に変換する", () => {
    expect(toHandArray("AsKh")).toEqual(["As", "Kh"]);
    expect(toHandArray(" AsKh ")).toEqual(["As", "Kh"]);
    expect(toHandArray("As Kh")).toEqual(["As", "Kh"]);
  });
});

describe("toHandString", () => {
  it("配列を文字列に戻す", () => {
    expect(toHandString(["As", "Kh"])).toBe("As Kh");
  });
});

describe("toHandsArray", () => {
  it("複数ハンドを配列に変換する", () => {
    expect(toHandsArray("AsKh; Td9c")).toEqual([
      ["As", "Kh"],
      ["Td", "9c"],
    ]);
  });

  it("スペース区切りでも変換できる", () => {
    expect(toHandsArray("As Kh ; Td 9c")).toEqual([
      ["As", "Kh"],
      ["Td", "9c"],
    ]);
  });
});

describe("toHandsString", () => {
  it("複数ハンドを文字列に戻す", () => {
    expect(
      toHandsString([
        ["As", "Kh"],
        ["Td", "9c"],
      ]),
    ).toBe("As Kh; Td 9c");
  });
});

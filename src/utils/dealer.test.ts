import { afterEach, describe, expect, it, vi } from "bun:test";
import { getAllCards } from "./card";
import { genHands, getAllCombos, getShuffledDeck } from "./dealer";

const mockRandomSequence = (values: number[]) => {
  let index = 0;
  vi.spyOn(Math, "random").mockImplementation(() => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getShuffledDeck", () => {
  it("除外カードを含めず52枚未満になる", () => {
    const excludes = ["As", "Kd"];
    const deck = getShuffledDeck(excludes);
    expect(deck.length).toBe(50);
    expect(deck).not.toContain("As");
    expect(deck).not.toContain("Kd");
  });

  it("全カードの順列を返す", () => {
    const deck = getShuffledDeck();
    expect(new Set(deck)).toEqual(new Set(getAllCards()));
  });
});

describe("getAllCombos", () => {
  it("全組み合わせは1326通り", () => {
    const combos = getAllCombos();
    expect(combos.length).toBe(1326);
  });

  it("除外カードがあると組み合わせ数が減る", () => {
    const combos = getAllCombos(["As"]);
    expect(combos.length).toBe(1275);
  });
});

describe("genHands", () => {
  it("2枚の異なるカードを返す", () => {
    mockRandomSequence([0, 0, 0.1, 0.3]);
    const hand = genHands(0);
    expect(hand.length).toBe(2);
    expect(hand[0]).not.toBe(hand[1]);
  });

  it("ランクの強い順に並ぶ", () => {
    mockRandomSequence([0, 0, 0.1, 0.3]);
    const hand = genHands(0);
    expect(hand).toEqual(["As", "Kh"]);
  });
});

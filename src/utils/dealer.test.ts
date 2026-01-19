import { afterEach, describe, expect, it, vi } from "bun:test";
import { getAllCards } from "./card";
import {
  genHand,
  getAllCombos,
  getShuffledDeck,
  shuffleAndDeal,
  sortCardsByRankAndSuit,
} from "./dealer";

const mockRandomSequence = (values: number[], maxCalls = 5000) => {
  let index = 0;
  vi.spyOn(Math, "random").mockImplementation(() => {
    if (index >= maxCalls) {
      throw new Error("mockRandomSequence: exceeded maxCalls");
    }
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

  it("各コンボはrank/suit順に並んでいる", () => {
    const combos = getAllCombos();
    for (const combo of combos) {
      const sorted = sortCardsByRankAndSuit([...combo]);
      expect(combo).toEqual(sorted);
    }
  });
});

describe("genHand", () => {
  it("2枚の異なるカードを返す", () => {
    mockRandomSequence([0, 0, 0.1, 0.3]);
    const hand = genHand(0);
    expect(hand.length).toBe(2);
    expect(hand[0]).not.toBe(hand[1]);
  });

  it("ランクの強い順に並ぶ", () => {
    mockRandomSequence([0, 0, 0.1, 0.3]);
    const hand = genHand(0);
    expect(hand).toEqual(["As", "Kh"]);
  });
  it("除外カードを含まない", () => {
    mockRandomSequence([0, 0.5, 0.2, 0.3]);
    const hand = genHand(0, ["As", "Kh"]);
    expect(hand).toEqual(["Ad", "Qh"]);
  });
});

describe("sortCardsByRankAndSuit", () => {
  it("ランク優先でスート順(s>h>d>c)に並ぶ", () => {
    const cards = ["9c", "As", "9s", "Ah", "9d", "9h"];
    const sorted = sortCardsByRankAndSuit([...cards]);
    expect(sorted).toEqual(["As", "Ah", "9s", "9h", "9d", "9c"]);
  });
});

describe("shuffleAndDeal", () => {
  it("hero/villainが重複せずデッキから除外される", () => {
    const { position, hero, villains, deck } = shuffleAndDeal({
      people: 9,
      heroStrength: 0,
    });
    const [villain] = villains;
    expect(position).toBeGreaterThanOrEqual(1);
    expect(position).toBeLessThanOrEqual(9);
    expect(hero.length).toBe(2);
    expect(villains.length).toBe(1);
    expect(villain?.length).toBe(2);
    expect(new Set([...hero, ...villain]).size).toBe(4);
    expect(deck.length).toBe(48);
    for (const card of [...hero, ...villain]) {
      expect(deck).not.toContain(card);
    }
  });
});

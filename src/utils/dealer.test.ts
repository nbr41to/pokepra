import { describe, expect, it } from "bun:test";
import { RANKS, SUITS } from "@/constants/card";
import { TIERS } from "@/constants/tiers";
import {
  genBoard,
  genHands,
  getAllCards,
  getAllHands,
  getHandsByTiers,
} from "./dealer";
import { getHandString } from "./preflop-range";

const combinationCount = (n: number, k: number) =>
  (n * (n - 1)) / (k === 2 ? 2 : 1); // k is always 2 here

describe("ディーラー関連ユーティリティ", () => {
  it("getAllCards は52枚すべてを重複なく返す", () => {
    const cards = getAllCards();
    expect(cards.length).toBe(RANKS.length * SUITS.length);
    const unique = new Set(cards);
    expect(unique.size).toBe(cards.length);
    // spot-check a few expected cards
    expect(cards).toContain("As");
    expect(cards).toContain("Kc");
    expect(cards).toContain("2h");
  });

  it("getAllHands は除外カードを尊重した全2枚組み合わせを返す", () => {
    const excludes = ["As", "Kd"];
    const cardsRemaining = RANKS.length * SUITS.length - excludes.length;
    const expectedCount = combinationCount(cardsRemaining, 2);
    const hands = getAllHands(excludes);

    expect(hands.length).toBe(expectedCount);
    hands.forEach((hand) => {
      expect(hand.length).toBe(2);
      expect(hand[0]).not.toBe(hand[1]);
      expect(excludes).not.toContain(hand[0]);
      expect(excludes).not.toContain(hand[1]);
    });

    const normalized = new Set(hands.map((h) => h.slice().sort().join("|")));
    expect(normalized.size).toBe(hands.length);
  });

  it("genHands はデッキから重複しない2枚をソートして返す", () => {
    for (let i = 0; i < 200; i += 1) {
      const hand = genHands();
      expect(hand.length).toBe(2);
      expect(hand[0]).not.toBe(hand[1]);
      hand.forEach((card) => {
        const rank = card[0] as (typeof RANKS)[number];
        const suit = card[1] as (typeof SUITS)[number];
        expect(RANKS.includes(rank)).toBe(true);
        expect(SUITS.includes(suit)).toBe(true);
      });
      const [a, b] = hand;
      const rankA = a[0] as (typeof RANKS)[number];
      const rankB = b[0] as (typeof RANKS)[number];
      expect(RANKS.indexOf(rankA)).toBeLessThanOrEqual(RANKS.indexOf(rankB));
    }
  });

  it("genHands は includeTies 指定時に TIERS フィルタを満たす", () => {
    const includeTies = 2; // Tier 1 and 2 hands
    const allowed = TIERS.slice(0, includeTies).flat();
    for (let i = 0; i < 100; i += 1) {
      const hand = genHands(includeTies);
      const handString = getHandString(hand);
      expect(allowed).toContain(handString);
    }
  });

  it("getHandsByTiers は指定Tierまでのハンドのみ返す", () => {
    const tierCount = 1;
    const allowed = new Set(TIERS.slice(0, tierCount).flat());
    const hands = getHandsByTiers(tierCount);

    // 期待される組み合わせ数 (AA, KK, QQ 各6通り, AKs 4通り, AKo 12通り)
    expect(hands.length).toBe(34);

    const normalized = new Set(hands.map((h) => h.slice().sort().join("|")));
    expect(normalized.size).toBe(hands.length);

    hands.forEach((hand) => {
      const handString = getHandString(hand);
      expect(allowed.has(handString)).toBe(true);
    });
  });

  it("getHandsByTiers は除外カードを考慮して生成する", () => {
    const tierCount = 1;
    const excludes = ["As", "Ad"]; // AA の一部を除外すると残り4通りに減る
    const hands = getHandsByTiers(tierCount, excludes);

    // Tier1: AA(6) KK(6) QQ(6) AKs(4) AKo(12) = 34
    // excludes = [As, Ad]
    // AA: 6 -> 1 (AhAc のみ)
    // AKs: 4 -> 2 (AhKh, AcKc)
    // AKo: 12 -> 6 (As/Ad を含む 6 通りを除外)
    // KK/QQ は影響なし
    const expectedTotal = 1 + 6 + 6 + 2 + 6; // 21

    expect(hands.length).toBe(expectedTotal);
    hands.forEach((hand) => {
      expect(hand).not.toContain("As");
      expect(hand).not.toContain("Ad");
    });
  });

  it("genBoard はデフォルトで3枚返し、usedCards を避ける", () => {
    const used = ["As", "Kh", "Qd"];
    const board = genBoard(undefined, used);
    expect(board.length).toBe(3);
    const unique = new Set(board);
    expect(unique.size).toBe(3);
    board.forEach((card) => {
      expect(used).not.toContain(card);
      const rank = card[0] as (typeof RANKS)[number];
      const suit = card[1] as (typeof SUITS)[number];
      expect(RANKS.includes(rank)).toBe(true);
      expect(SUITS.includes(suit)).toBe(true);
    });
  });

  it("genBoard は1枚指定にも対応し、usedCards を避ける", () => {
    const used = ["As", "Kh", "Qd"];
    const board = genBoard(1, used);
    expect(board.length).toBe(1);
    const card = board[0];
    expect(used).not.toContain(card);
    const rank = card[0] as (typeof RANKS)[number];
    const suit = card[1] as (typeof SUITS)[number];
    expect(RANKS.includes(rank)).toBe(true);
    expect(SUITS.includes(suit)).toBe(true);
  });
});

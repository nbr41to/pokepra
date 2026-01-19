import { describe, expect, it } from "vitest";
import { generateBoardByConditions } from "@/utils/board";
import { CARD_RANK_ORDER } from "@/utils/card";

const getRankValue = (card: string) => CARD_RANK_ORDER[card[0] ?? ""] ?? 0;
const getSuit = (card: string) => card[1] ?? "";

const isMonotone = (board: string[]) => new Set(board.map(getSuit)).size === 1;

const isTwoTone = (board: string[]) => new Set(board.map(getSuit)).size === 2;

const isRainbow = (board: string[]) =>
  new Set(board.map(getSuit)).size === board.length;

const isPair = (board: string[]) =>
  new Set(board.map((card) => card[0] ?? "")).size < board.length;

const isLowBoard = (board: string[]) =>
  board.every((card) => getRankValue(card) <= 8);

const isHighBoard = (board: string[]) => {
  const highCount = board.filter((card) => getRankValue(card) >= 10).length;
  return highCount >= 1 && highCount <= 3;
};

const isStraightSubset = (ranks: number[], count: number) => {
  const rankSet = new Set(ranks);
  const rankSetWithAceLow = new Set(
    ranks.map((rank) => (rank === 14 ? 1 : rank)),
  );

  if (count === 5 && rankSet.size !== 5) {
    return false;
  }

  for (let start = 1; start <= 10; start += 1) {
    const straight = new Set<number>();
    for (let i = 0; i < 5; i += 1) {
      const value = start + i;
      straight.add(value === 14 ? 14 : value);
    }
    const match = ranks.every(
      (rank) =>
        straight.has(rank) ||
        (rank === 14 && straight.has(1) && rankSetWithAceLow.has(1)),
    );
    if (match) return true;
  }
  return false;
};

const isConnectedBoard = (board: string[]) =>
  isStraightSubset(board.map(getRankValue), board.length);

describe("generateBoardByConditions", () => {
  it("monotone", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "monotone",
      maxAttempts: 20000,
    });
    expect(isMonotone(board)).toBe(true);
  });

  it("two-tone", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "two-tone",
      maxAttempts: 20000,
    });
    expect(isTwoTone(board)).toBe(true);
  });

  it("pair", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "pair",
      maxAttempts: 20000,
    });
    expect(isPair(board)).toBe(true);
  });

  it("rainbow", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "rainbow",
      maxAttempts: 20000,
    });
    expect(isRainbow(board)).toBe(true);
  });

  it("connected", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "connected",
      maxAttempts: 20000,
    });
    expect(isConnectedBoard(board)).toBe(true);
  });

  it("high", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "high",
      maxAttempts: 20000,
    });
    expect(isHighBoard(board)).toBe(true);
  });

  it("low", () => {
    const board = generateBoardByConditions({
      count: 3,
      conditions: "low",
      maxAttempts: 20000,
    });
    expect(isLowBoard(board)).toBe(true);
  });
});

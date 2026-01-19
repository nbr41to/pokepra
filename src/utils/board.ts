/**
 * board.ts
 * ボードに関するutils
 */
import { CARD_RANK_ORDER, getAllCards } from "@/utils/card";
import { shuffleArray } from "@/utils/general";

type BoardCondition =
  | "monotone"
  | "two-tone"
  | "pair"
  | "rainbow"
  | "connected"
  | "high"
  | "low";

type GenerateBoardOptions = {
  count?: number;
  excludes?: string[];
  conditions?: BoardCondition | BoardCondition[];
  maxAttempts?: number;
};

const DEFAULT_MAX_ATTEMPTS = 5000;

const getRankValue = (card: string) => CARD_RANK_ORDER[card[0] ?? ""] ?? 0;
const getSuit = (card: string) => card[1] ?? "";

/**
 * Condition
 */
const isMonotone = (board: string[]) => {
  const suits = board.map(getSuit);
  return new Set(suits).size === 1;
};

const isTwoTone = (board: string[]) => {
  const suits = board.map(getSuit);
  return new Set(suits).size === 2;
};

const isRainbow = (board: string[]) => {
  const suits = board.map(getSuit);
  const unique = new Set(suits).size;
  return unique === board.length;
};

const isPair = (board: string[]) => {
  const ranks = board.map((card) => card[0] ?? "");
  return new Set(ranks).size < board.length;
};

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

const isConnectedBoard = (board: string[]) => {
  const ranks = board.map(getRankValue);
  return isStraightSubset(ranks, board.length);
};

const normalizeConditions = (conditions?: BoardCondition | BoardCondition[]) =>
  Array.isArray(conditions) ? conditions : conditions ? [conditions] : [];

const matchesConditions = (board: string[], conditions: BoardCondition[]) =>
  conditions.every((condition) => {
    switch (condition) {
      case "monotone":
        return isMonotone(board);
      case "two-tone":
        return isTwoTone(board);
      case "pair":
        return isPair(board);
      case "rainbow":
        return isRainbow(board);
      case "connected":
        return isConnectedBoard(board);
      case "high":
        return isHighBoard(board);
      case "low":
        return isLowBoard(board);
      default:
        return true;
    }
  });

const normalizeExcludes = (excludes?: string[]) =>
  excludes?.map((card) => card.trim()).filter(Boolean) ?? [];

/**
 * 条件に一致するボードを指定枚数生成する
 * @param count ボード枚数 (3〜5)
 * @param excludes 除外するカード
 * @param conditions ボード条件 (複数指定可)
 * @param maxAttempts 探索の試行回数
 */
function generateBoardByConditions({
  count = 3,
  excludes = [],
  conditions = [],
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: GenerateBoardOptions = {}): string[] {
  if (count < 3 || count > 5) {
    throw new Error("Board count must be between 3 and 5.");
  }

  const excludeSet = new Set(normalizeExcludes(excludes));
  const available = getAllCards().filter((card) => !excludeSet.has(card));

  if (available.length < count) {
    throw new Error("Not enough cards to generate a board.");
  }

  const resolvedConditions = normalizeConditions(conditions);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidates = shuffleArray(available).slice(0, count);
    if (
      resolvedConditions.length === 0 ||
      matchesConditions(candidates, resolvedConditions)
    ) {
      return candidates;
    }
  }

  throw new Error("No board matches the given conditions.");
}

export type { BoardCondition, GenerateBoardOptions };
export { generateBoardByConditions, DEFAULT_MAX_ATTEMPTS };

// @ts-expect-error
import PokerResolver from "pokersolver";

enum HandRank {
  "High Card" = 1,
  "One Pair" = 2,
  "Two Pair" = 3,
  "Three of a Kind" = 4,
  Straight = 5,
  Flush = 6,
  "Full House" = 7,
  "Four of a Kind" = 8,
  "Straight Flush" = 9,
  "Royal Flush" = 10,
}

type ReturnType = {
  name: keyof typeof HandRank;
  rank: HandRank;
  cards: string[];
  // ※他にもある
};

/**
 * カードから約を算出
 */
function solve(cards: string[]) {
  const result: ReturnType = PokerResolver.Hand.solve(cards);

  return result;
}

/**
 * 複数のハンドから勝敗を算出
 */
function winner(hands: ReturnType[]) {
  const result: ReturnType[] = PokerResolver.Hand.winners(hands);

  return result;
}

export { solve, winner };

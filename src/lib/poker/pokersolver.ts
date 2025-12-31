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
};

async function solve(cards: string[]) {
  const solve: Promise<ReturnType> = new Promise((resolve) => {
    const hand = PokerResolver.Hand.solve(cards);

    resolve(hand);
  });

  return solve;
}

function winner(hands: { board: string[]; hands: string[][] }[]) {
  const results: ReturnType[][] = [];
  hands.forEach(async (item) => {
    const handResults: ReturnType[] = [];
    for (const hand of item.hands) {
      const result = await solve([...item.board, ...hand]);
      handResults.push(result);
    }
    results.push(handResults);
  });

  return results;
}

export { solve, winner };

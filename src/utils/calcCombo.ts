import { solve } from "@/lib/poker/pokersolver";
import { getAllCards } from "./dealer";

function getAllHands(excludes: string[] = []) {
  const allCards = getAllCards().filter((card) => !excludes.includes(card));
  const allHands: string[][] = [];

  // Generate all possible 2-card combinations
  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      allHands.push([allCards[i], allCards[j]]);
    }
  }

  return allHands;
}

async function getCombos(board: string[]) {
  if (board.length < 3) {
    throw new Error("Board must have at least 3 cards");
  }

  const allHands = getAllHands(board);

  const solves = Promise.all(
    allHands.map(async (hand) => {
      const result = await solve([...board, ...hand]);

      return { hand, result };
    }),
  );

  return solves;
}

export { getAllHands, getCombos };

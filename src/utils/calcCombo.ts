import {
  isFlush,
  isFourOfAKind,
  isFullHouse,
  isStraight,
  isStraightFlush,
  isThreeOfAKind,
} from "./calc-hand";
import { getAllCards } from "./dealer";

function getCombos(board: string[]): {
  threeOfAKind: string[][];
  straight: string[][];
  flush: string[][];
  fullHouse: string[][];
  fourOfAKind: string[][];
  straightFlush: string[][];
} {
  if (board.length < 3) {
    throw new Error("Board must have at least 3 cards");
  }
  const allCards = getAllCards().filter((card) => !board.includes(card));
  const allCombos: string[][] = [];

  // Generate all possible 2-card combinations from the remaining cards
  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      allCombos.push([allCards[i], allCards[j]]);
    }
  }

  const threeOfAKind: string[][] = [];
  const straight: string[][] = [];
  const flush: string[][] = [];
  const fullHouse: string[][] = [];
  const fourOfAKind: string[][] = [];
  const straightFlush: string[][] = [];

  for (const combo of allCombos) {
    if (isStraightFlush([...combo, ...board])) {
      straightFlush.push(combo);
    }
    if (isFourOfAKind([...combo, ...board])) {
      fourOfAKind.push(combo);
    }
    if (isFullHouse([...combo, ...board])) {
      fullHouse.push(combo);
    }
    if (isFlush([...combo, ...board])) {
      flush.push(combo);
    }
    if (isStraight([...combo, ...board])) {
      straight.push(combo);
    }
    if (isThreeOfAKind([...combo, ...board])) {
      threeOfAKind.push(combo);
    }
  }

  return {
    threeOfAKind,
    straight,
    flush,
    fullHouse,
    fourOfAKind,
    straightFlush,
  };
}

export { getCombos };

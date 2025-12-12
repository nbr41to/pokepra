import { TIERS } from "@/constants/tiers";

/**
 * `src/constants/tiers.ts`とargsのhandsとpositionから"open-raise"か"fold"を返す
 */

function getTierIndexByPosition(position: string) {
  const positionToTierIndex: { [key: string]: number } = {
    UTG: 2,
    B7: 3,
    B6: 3,
    B5: 4,
    B4: 4,
    B3: 5,
    BTN: 6,
    BB: 7,
  };

  return positionToTierIndex[position] ?? -1;
}

const rankOrder: { [key: string]: number } = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  9: 9,
  8: 8,
  7: 7,
  6: 6,
  5: 5,
  4: 4,
  3: 3,
  2: 2,
};
function getSortedRank(hand1: string, hand2: string) {
  return [hand1[0], hand2[0]]
    .sort((a, b) => rankOrder[b] - rankOrder[a])
    .join("");
}
function getSuited(hand1: string, hand2: string) {
  return hand1[1] === hand2[1];
}
function getHandString(hands: string[]) {
  const rankString = getSortedRank(hands[0], hands[1]);
  const suited = getSuited(hands[0], hands[1]);
  return rankString[0] === rankString[1]
    ? rankString
    : rankString + (suited ? "s" : "o");
}

function getResult(hands: string[], position: string): "open-raise" | "fold" {
  const tierIndex = getTierIndexByPosition(position);
  const tierIndexes = Array.from({ length: tierIndex + 1 }, (_, i) => i);
  const openRaiseHands = tierIndexes.flatMap((index) => TIERS[index]);

  const handString = getHandString(hands);
  if (openRaiseHands.includes(handString)) {
    return "open-raise";
  } else {
    return "fold";
  }
}

export { getHandString, getResult };

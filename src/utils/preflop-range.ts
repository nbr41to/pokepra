import { RANK_ORDER } from "@/constants/card";
import { TIERS } from "@/constants/tiers";

/* PreflopのRange表周りのユーティリティ */

/**
 * PositionからRange表のTierを返す
 */
function getTierIndexByPosition(position: number, people: number = 9) {
  // SB(people - 1) を除外した 1-based seat number を受け取る
  if (people < 2 || people > 9) return -1;
  if (position < 1 || position > people) return -1;
  if (position === people - 1) return -1; // SB は対象外

  // position をもとに Tier Index を引く (9max 想定)
  const positionToTierIndexes = [7, 6, 5, 5, 4, 4, 3, 3, 3];
  const afterPositions = people - position;
  // SB を除外するため afterPositions が people - 1 になるパターンはスキップされている

  const tierIndex = positionToTierIndexes[afterPositions];
  if (typeof tierIndex !== "number") {
    return -1;
  }

  return tierIndex;
}

function getSortedRank(hand1: string, hand2: string) {
  return [hand1[0], hand2[0]]
    .sort((a, b) => RANK_ORDER[b] - RANK_ORDER[a])
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

function judgeInRange(hands: string[], position: number) {
  const tierIndex = getTierIndexByPosition(position);
  const tierIndexes = Array.from({ length: tierIndex + 1 }, (_, i) => i);
  const openRaiseHands = tierIndexes.flatMap((index) => TIERS[index]);
  const handString = getHandString(hands);

  return openRaiseHands.includes(handString);
}

export {
  getTierIndexByPosition,
  getSuited,
  getSortedRank,
  getHandString,
  judgeInRange,
};

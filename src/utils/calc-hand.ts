import { RANK_ORDER } from "@/constants/card";

const isOnePair = (cards: string[]): boolean => {
  const rankCount: Record<string, number> = {};
  for (const card of cards) {
    const rank = card[0];
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  }
  return Object.values(rankCount).some((count) => count === 2);
};

const isTwoPair = (cards: string[]): boolean => {
  const rankCount: Record<string, number> = {};
  for (const card of cards) {
    const rank = card[0];
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  }
  const pairs = Object.values(rankCount).filter((count) => count === 2);

  return pairs.length >= 2;
};

const isThreeOfAKind = (cards: string[]): boolean => {
  const rankCount: Record<string, number> = {};
  for (const card of cards) {
    const rank = card[0];
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  }
  return Object.values(rankCount).some((count) => count === 3);
};

const isStraight = (cards: string[]): boolean => {
  const rankSet = new Set<string>();
  for (const card of cards) {
    rankSet.add(card[0]);
  }
  const ranks = Array.from(rankSet).map((rank) => RANK_ORDER[rank]);
  ranks.sort((a, b) => a - b);

  // Check for normal straight
  for (let i = 0; i <= ranks.length - 5; i++) {
    if (
      ranks[i + 4] - ranks[i] === 4 &&
      new Set(ranks.slice(i, i + 5)).size === 5
    ) {
      return true;
    }
  }

  // Check for wheel straight (A-2-3-4-5)
  if (
    rankSet.has("A") &&
    rankSet.has("2") &&
    rankSet.has("3") &&
    rankSet.has("4") &&
    rankSet.has("5")
  ) {
    return true;
  }

  return false;
};

const isFlush = (cards: string[]): boolean => {
  const suitCount: Record<string, number> = {};
  for (const card of cards) {
    const suit = card[1];
    suitCount[suit] = (suitCount[suit] || 0) + 1;
  }
  return Object.values(suitCount).some((count) => count >= 5);
};

const isFullHouse = (cards: string[]): boolean => {
  const rankCount: Record<string, number> = {};
  for (const card of cards) {
    const rank = card[0];
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  }
  const counts = Object.values(rankCount);
  const hasThree = counts.some((count) => count >= 3);
  const hasTwo = counts.filter((count) => count >= 2).length >= 2;

  return hasThree && hasTwo;
};

const isFourOfAKind = (cards: string[]): boolean => {
  const rankCount: Record<string, number> = {};
  for (const card of cards) {
    const rank = card[0];
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  }
  return Object.values(rankCount).some((count) => count === 4);
};

const isStraightFlush = (cards: string[]): boolean => {
  const suitToRanks: Record<string, Set<string>> = {};
  for (const card of cards) {
    const rank = card[0];
    const suit = card[1];
    if (!suitToRanks[suit]) {
      suitToRanks[suit] = new Set<string>();
    }
    suitToRanks[suit].add(rank);
  }

  for (const ranksSet of Object.values(suitToRanks)) {
    const ranks = Array.from(ranksSet).map((rank) => RANK_ORDER[rank]);
    ranks.sort((a, b) => a - b);

    // Check for normal straight flush
    for (let i = 0; i <= ranks.length - 5; i++) {
      if (
        ranks[i + 4] - ranks[i] === 4 &&
        new Set(ranks.slice(i, i + 5)).size === 5
      ) {
        return true;
      }
    }

    // Check for wheel straight flush (A-2-3-4-5)
    if (
      ranksSet.has("A") &&
      ranksSet.has("2") &&
      ranksSet.has("3") &&
      ranksSet.has("4") &&
      ranksSet.has("5")
    ) {
      return true;
    }
  }

  return false;
};

export {
  isOnePair,
  isTwoPair,
  isThreeOfAKind,
  isStraight,
  isFlush,
  isFullHouse,
  isFourOfAKind,
  isStraightFlush,
};

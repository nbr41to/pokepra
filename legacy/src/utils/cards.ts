export const INITIAL_DECK = [
  /* spade */
  "s-1",
  "s-2",
  "s-3",
  "s-4",
  "s-5",
  "s-6",
  "s-7",
  "s-8",
  "s-9",
  "s-10",
  "s-11",
  "s-12",
  "s-13",
  /* club */
  "c-1",
  "c-2",
  "c-3",
  "c-4",
  "c-5",
  "c-6",
  "c-7",
  "c-8",
  "c-9",
  "c-10",
  "c-11",
  "c-12",
  "c-13",
  /* heart */
  "h-1",
  "h-2",
  "h-3",
  "h-4",
  "h-5",
  "h-6",
  "h-7",
  "h-8",
  "h-9",
  "h-10",
  "h-11",
  "h-12",
  "h-13",
  /* diamond */
  "d-1",
  "d-2",
  "d-3",
  "d-4",
  "d-5",
  "d-6",
  "d-7",
  "d-8",
  "d-9",
  "d-10",
  "d-11",
  "d-12",
  "d-13",
];

/**
 * カードをシャッフル
 */
export const shuffleCard = (deck: string[]) => {
  const shuffledDeck = deck.slice();
  for (let i = 0; i < shuffledDeck.length; i++) {
    const j = Math.floor(Math.random() * shuffledDeck.length);
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  return shuffledDeck;
};

/**
 * カードを見て約と対象のカードを返す
 */
type HandRank =
  | "High Card"
  | "One Pair"
  | "Two Pair"
  | "Three of a Kind"
  | "Straight"
  | "Flush"
  | "Full House"
  | "Four of a Kind"
  | "Straight Flush"
  | "Royal Flush";

interface HandResult {
  rank: HandRank;
  cards: string[];
}

export function evaluateHand(cards: string[]): HandResult {
  const getCardRank = (card: string) => Number.parseInt(card.split("-")[1], 10);
  const getCardSuit = (card: string) => card.split("-")[0];

  const sortedCards = [...cards].sort(
    (a, b) => getCardRank(b) - getCardRank(a),
  );

  const rankGroups = sortedCards.reduce(
    (acc: Record<string, string[]>, card) => {
      const rank = getCardRank(card).toString();
      acc[rank] = acc[rank] || [];
      acc[rank].push(card);
      return acc;
    },
    {},
  );

  const suitGroups = sortedCards.reduce(
    (acc: Record<string, string[]>, card) => {
      const suit = getCardSuit(card);
      acc[suit] = acc[suit] || [];
      acc[suit].push(card);
      return acc;
    },
    {},
  );

  // Check for Flush
  const flushSuit = Object.keys(suitGroups).find(
    (suit) => suitGroups[suit].length >= 5,
  );
  const flushCards = flushSuit
    ? suitGroups[flushSuit]
        .sort((a, b) => getCardRank(b) - getCardRank(a))
        .slice(0, 5)
    : [];

  // Check for Straight
  const uniqueRanks = Array.from(
    new Set(sortedCards.map((card) => getCardRank(card))),
  );
  const isStraight = (() => {
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
        return uniqueRanks
          .slice(i, i + 5)
          .map(
            (rank) =>
              sortedCards.find((card) => getCardRank(card) === rank) as string,
          );
      }
    }
    if (
      uniqueRanks.includes(14) &&
      uniqueRanks.slice(-4).toString() === "5,4,3,2"
    ) {
      return sortedCards
        .filter((card) => [14, 5, 4, 3, 2].includes(getCardRank(card)))
        .slice(0, 5);
    }
    return null;
  })();

  const straightCards = isStraight || [];

  // Check for Straight Flush
  const straightFlushCards = flushCards.length
    ? straightCards.filter((card) => getCardSuit(card) === flushSuit)
    : [];

  const rankCounts = Object.values(rankGroups).sort(
    (a, b) => b.length - a.length || getCardRank(b[0]) - getCardRank(a[0]),
  );

  if (straightFlushCards.length === 5) {
    return {
      rank: straightFlushCards[0].includes("-14")
        ? "Royal Flush"
        : "Straight Flush",
      cards: straightFlushCards,
    };
  }
  if (rankCounts[0].length === 4) {
    return {
      rank: "Four of a Kind",
      cards: rankCounts[0].concat(rankCounts[1][0]),
    };
  }
  if (rankCounts[0].length === 3 && rankCounts[1]?.length >= 2) {
    return {
      rank: "Full House",
      cards: rankCounts[0].concat(rankCounts[1].slice(0, 2)),
    };
  }
  if (flushCards.length === 5) {
    return { rank: "Flush", cards: flushCards };
  }
  if (straightCards.length === 5) {
    return { rank: "Straight", cards: straightCards };
  }
  if (rankCounts[0].length === 3) {
    return {
      rank: "Three of a Kind",
      cards: rankCounts[0].concat(rankCounts.slice(1).flat().slice(0, 2)),
    };
  }
  if (rankCounts[0].length === 2 && rankCounts[1]?.length === 2) {
    return {
      rank: "Two Pair",
      cards: rankCounts[0].concat(rankCounts[1]).concat(rankCounts[2][0]),
    };
  }
  if (rankCounts[0].length === 2) {
    return {
      rank: "One Pair",
      cards: rankCounts[0].concat(rankCounts.slice(1).flat().slice(0, 3)),
    };
  }
  return { rank: "High Card", cards: sortedCards.slice(0, 5) };
}

const RANKS = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const;

const RANK_ORDER: { [key: string]: number } = {
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
} as const;

enum SUIT {
  SPADE = "s",
  HEART = "h",
  DIAMOND = "d",
  CLUB = "c",
}

const SUITS: SUIT[] = [SUIT.SPADE, SUIT.HEART, SUIT.DIAMOND, SUIT.CLUB];

export { RANKS, RANK_ORDER, SUIT, SUITS };

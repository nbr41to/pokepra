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

enum SUIT {
  SPADE = "s",
  HEART = "h",
  DIAMOND = "d",
  CLUB = "c",
}

const SUITS: SUIT[] = [SUIT.SPADE, SUIT.HEART, SUIT.DIAMOND, SUIT.CLUB];

export { RANKS, SUIT, SUITS };

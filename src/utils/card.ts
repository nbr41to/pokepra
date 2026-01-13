/**
 * card.ts
 * カードやその記号に関するutils
 */

/**
 * Card
 */
const CARD_RANKS = [
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

const CARD_RANK_ORDER: { [key: string]: number } = {
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

enum CARD_SUIT {
  SPADE = "s",
  HEART = "h",
  DIAMOND = "d",
  CLUB = "c",
}

const CARD_SUITS: CARD_SUIT[] = [
  CARD_SUIT.SPADE,
  CARD_SUIT.HEART,
  CARD_SUIT.DIAMOND,
  CARD_SUIT.CLUB,
] as const;

/**
 * すべてのカードを取得
 */
function getAllCards(): string[] {
  const cards: string[] = [];
  for (const rank of CARD_RANKS) {
    for (const suit of CARD_SUITS) {
      cards.push(rank + suit);
    }
  }

  return cards;
}

/**
 * "As Kh" -> ["As", "Kh"]
 * @param handString string
 */
function toHandArray(handString: string): string[] {
  const trimmed = handString.trim().replace(/\s+/g, "");

  return [trimmed.slice(0, 2), trimmed.slice(2, 4)];
}

/**
 * "As Kh; Td 9c" -> [ ["As", "Kh"], ["Td", "9c"] ]
 * @param handString string
 */
function toHandsArray(handString: string): string[][] {
  const trimmed = handString.trim();
  const handStrings = trimmed.split(/\s*;\s*/);

  return handStrings.map((hand) => toHandArray(hand));
}

/**
 * ["As", "Kh"] -> "As Kh"
 * @param handArray string[]
 */
function toHandString(handArray: string[]): string {
  return handArray.join(" ");
}

/**
 * [ ["As", "Kh"], ["Td", "9c"] ] -> "As Kh; Td 9c"
 * @param handsArray string[][]
 */
function toHandsString(handsArray: string[][]): string {
  return handsArray.map((hand) => toHandString(hand)).join("; ");
}

export {
  CARD_RANKS,
  CARD_RANK_ORDER,
  CARD_SUIT,
  CARD_SUITS,
  getAllCards,
  toHandArray,
  toHandsArray,
  toHandString,
  toHandsString,
};

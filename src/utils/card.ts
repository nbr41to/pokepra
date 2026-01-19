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

enum CARD_SUIT_ORDER {
  SPADE = 1,
  HEART = 2,
  DIAMOND = 3,
  CLUB = 4,
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
 * 文字列を配列に変換
 * "As Kh" -> ["As", "Kh"]
 * "Kh 4s Td" -> ["Kh", "4s", "Td"]
 * @param handString string
 */
function toCardsArray(handString: string): string[] {
  const trimmed = handString.trim().replace(/\s+/g, "");

  return trimmed.match(/.{1,2}/g) || [];
}

/**
 * 文字列を複数のハンドの配列に変換
 * "As Kh; Td 9c" -> [ ["As", "Kh"], ["Td", "9c"] ]
 * @param handString string
 * ※ハンドのみ
 */
function toHandsArray(handString: string): string[][] {
  const trimmed = handString.trim();
  const handStrings = trimmed.split(/\s*;\s*/);

  return handStrings.map((hand) => toCardsArray(hand));
}

/**
 * 配列を文字列に変換
 * ["As", "Kh"] -> "As Kh"
 * ["Kh", "4s", "Td"] -> "Kh 4s Td"
 * @param handArray string[]
 */
function toCardsString(handArray: string[]): string {
  return handArray.join(" ");
}

/**
 * 配列を複数のハンドの文字列に変換
 * [ ["As", "Kh"], ["Td", "9c"] ] -> "As Kh; Td 9c"
 * @param handsArray string[][]
 */
function toHandsString(handsArray: string[][]): string {
  return handsArray.map((hand) => toCardsString(hand)).join("; ");
}

export {
  CARD_RANKS,
  CARD_RANK_ORDER,
  CARD_SUIT,
  CARD_SUIT_ORDER,
  CARD_SUITS,
  getAllCards,
  toCardsArray,
  toHandsArray,
  toCardsString,
  toHandsString,
};

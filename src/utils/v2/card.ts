/**
 * card.ts
 * トランプ（カード）に関する定義。
 *
 * 設計方針:
 * - カードは CardId（0 ~ 51 の整数）を主表現とする。
 * - クラスではなく純粋関数の集合として API を提供する。
 *   Card インスタンスへのアロケーション/詰め替えコストを避けるため。
 * - WASM 側（Rust）の u8 表現とそのまま受け渡せる。
 *
 * 命名規則:
 * - すべての関数名は対象が CardId であることを名前に含める。
 *   `import { parseCardId } from "./card"` のような named import でも
 *   意図が伝わるようにするため。
 *
 * 使用例:
 *   import {
 *     toCardId, parseCardId, cardIdToString,
 *     valueOfId, suitOfId,
 *   } from "./card";
 *
 *   parseCardId("As");                    // → CardId (51)
 *   cardIdToString(51);                   // → "As"
 *   toCardId(VALUE.ACE, SUIT.SPADE);      // → CardId
 *   valueOfId(51);                        // → 12 (= VALUE.ACE)
 *   suitOfId(51);                         // → 3  (= SUIT.SPADE)
 */

/* definition */

/**
 * Value
 * カードの数字。0(2) ~ 12(A) の整数。
 */
export const VALUE = {
  TWO: 0,
  THREE: 1,
  FOUR: 2,
  FIVE: 3,
  SIX: 4,
  SEVEN: 5,
  EIGHT: 6,
  NINE: 7,
  TEN: 8,
  JACK: 9,
  QUEEN: 10,
  KING: 11,
  ACE: 12,
} as const;
export type Value = (typeof VALUE)[keyof typeof VALUE];

/**
 * Value を 1 文字で表記するための配列。
 * index は Value enum と一致する（0 = "2", ..., 12 = "A"）昇順。
 */
export const VALUE_CHARS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
] as const;
export type ValueChar = (typeof VALUE_CHARS)[number];

/**
 * Suit
 * カードのマーク。0(c) ~ 3(s) の整数。
 */
export const SUIT = {
  CLUB: 0,
  DIAMOND: 1,
  HEART: 2,
  SPADE: 3,
} as const;
export type Suit = (typeof SUIT)[keyof typeof SUIT];

/**
 * Suit を 1 文字で表記するための配列。
 * index は Suit enum と一致する（0 = "c", ..., 3 = "s"）。
 */
export const SUIT_CHARS = ["c", "d", "h", "s"] as const;
export type SuitChar = (typeof SUIT_CHARS)[number];

/**
 * CardId
 * 0 ~ 51 の整数で 1 枚のカードを表す。
 * (value << 2) | suit と等価（= value * 4 + suit）。
 *
 * number と同じ実行時表現のまま、TypeScript 上では通常の number と区別する。
 * CardId を作る経路は toCardId / parseCardId / assertValidCardId に寄せる。
 */
export type CardId = number & { readonly _typename: "CardId" };

/**
 * CardString
 * "As", "Td" のような 2 文字のカード表記。
 * 高い方が value（大文字）、低い方が suit（小文字）。
 */
export type CardString = `${ValueChar}${SuitChar}`;

/* functions */

/**
 * 任意の数値が有効な CardId（0 ~ 51 の整数）であることを検証する。
 * 不正な場合は RangeError を投げる。
 *
 * TypeScript の assertion function として動作するため、
 * 呼び出し後は引数の型が CardId に narrowing される。
 *
 *   const raw: number = receiveFromWasm();
 *   assertValidCardId(raw);
 *   // ここ以降 raw は CardId として扱える
 */
export function assertValidCardId(n: number): asserts n is CardId {
  if (!Number.isInteger(n) || n < 0 || n > 51) {
    throw new RangeError(`CardId must be an integer in [0, 51], got ${n}`);
  }
}

/** CardId から value を取り出す（id >>> 2 と等価）。 */
export const valueOfId = (id: CardId): Value => (id >>> 2) as Value;

/** CardId から suit を取り出す（id & 0b11 と等価）。 */
export const suitOfId = (id: CardId): Suit => (id & 0b11) as Suit;

/** value と suit から CardId を生成する。 */
export const toCardId = (value: Value, suit: Suit): CardId =>
  ((value << 2) | suit) as CardId;

/**
 * CardId を 2 文字の表記に変換する（例: 51 → "As"）。
 */
export const cardIdToString = (id: CardId): CardString =>
  `${VALUE_CHARS[valueOfId(id)]}${SUIT_CHARS[suitOfId(id)]}` as CardString;

/**
 * "As", "Td" のような 2 文字表記から CardId を生成する。
 * 不正な入力では RangeError を投げる。
 */
export function parseCardId(s: string): CardId {
  const v = VALUE_CHARS.indexOf(s[0] as ValueChar);
  const su = SUIT_CHARS.indexOf(s[1] as SuitChar);
  if (s.length !== 2 || v < 0 || su < 0) {
    throw new RangeError(`Invalid card string: "${s}"`);
  }
  return ((v << 2) | su) as CardId;
}

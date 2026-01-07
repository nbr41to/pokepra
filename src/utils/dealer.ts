import { RANKS, SUITS } from "@/constants/card";
import { TIERS } from "@/constants/tiers";
import { getHandString } from "./preflop-range";

/**
 * 指定した数字の範囲内で乱数を生成
 * ※ internal use only
 */
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * すべてのカードを取得
 */
function getAllCards(): string[] {
  const cards: string[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      cards.push(rank + suit);
    }
  }

  return cards;
}

/**
 * 配列をシャッフル
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * すべてのカードをシャッフルしてゲームに使用するdeckを作成
 */
function getShuffledDeck(excludes: string[] = []): string[] {
  const allCards = getAllCards().filter((card) => !excludes.includes(card));
  return shuffleArray(allCards);
}

/**
 * すべてのハンドを取得
 * @param excludes
 */
function getAllHands(excludes: string[] = []) {
  const allCards = getAllCards().filter((card) => !excludes.includes(card));
  const allHands: string[][] = [];

  for (let i = 0; i < allCards.length; i++) {
    for (let j = i + 1; j < allCards.length; j++) {
      allHands.push([allCards[i], allCards[j]]);
    }
  }

  return allHands;
}

/**
 * 指定したtiers以上のハンドをすべて生成
 * @param tiers number
 */
function getHandsByTiers(tiers: number, excludes: string[] = []) {
  const allowedHands = TIERS.slice(0, tiers).flat();
  const allHands = getAllHands(excludes);

  return allHands.filter((hand) => {
    const handString = getHandString(hand);
    return allowedHands.includes(handString);
  });
}

/**
 * [A, K, Q, T, 2 ~ 9]
 * [s, h, d, c]
 * の組み合わせの2文字をランダムで返す
 * includeTies: TIERSの何番目までを含めるか (デフォルト: 0 -> 全て)
 */
function genHands(includeTies = 0, excludes: string[] = []) {
  let [hand1, hand2]: string[] = [];

  do {
    hand1 =
      RANKS[getRandomInt(RANKS.length)] + SUITS[getRandomInt(SUITS.length)];
    hand2 =
      RANKS[getRandomInt(RANKS.length)] + SUITS[getRandomInt(SUITS.length)];

    // hand1とhand2が被らないようにする
    while (hand1 === hand2) {
      hand2 =
        RANKS[getRandomInt(RANKS.length)] + SUITS[getRandomInt(SUITS.length)];
    }
  } while (
    hand1 === hand2 ||
    (includeTies !== 0 &&
      !TIERS.slice(0, includeTies - 1)
        .flat()
        .includes(getHandString([hand1, hand2]))) ||
    excludes.includes(hand1) ||
    excludes.includes(hand2)
  ); // includeTiesが指定されている場合、該当するtierに含まれるまで繰り返す

  // rankの大きい順に並び替え
  const rankOrder = (rank: string) =>
    RANKS.indexOf(rank as (typeof RANKS)[number]);

  const handArray = [hand1, hand2].sort((a, b) => {
    return rankOrder(a[0]) - rankOrder(b[0]);
  });

  return handArray;
}

/**
 * Boardのカードを生成
 */
function genBoard(cardCount: 1 | 3 = 3, usedCards: string[] = []) {
  const board: string[] = [];

  while (board.length < cardCount) {
    const card =
      RANKS[getRandomInt(RANKS.length)] + SUITS[getRandomInt(SUITS.length)];

    // usedCardsとboardに含まれないカードを追加
    if (!usedCards.includes(card) && !board.includes(card)) {
      board.push(card);
    }
  }

  return board;
}

export {
  getShuffledDeck,
  getAllCards,
  getAllHands,
  getHandsByTiers,
  genHands,
  genBoard,
};

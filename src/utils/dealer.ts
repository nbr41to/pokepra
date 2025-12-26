/* Handに関するutils */

import { RANKS, SUITS } from "@/constants/card";
import { TIERS } from "@/constants/tiers";
import { getHandString } from "./getResult";

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
 * [A, K, Q, T, 2 ~ 9]
 * [s, h, d, c]
 * の組み合わせの2文字をランダムで返す
 * includeTies: TIERSの何番目までを含めるか (デフォルト: 0 -> 全て)
 */
function genHands(includeTies = 0) {
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

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
    includeTies !== 0 &&
    !TIERS.slice(0, includeTies - 1)
      .flat()
      .includes(getHandString([hand1, hand2]))
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
function genBoard(cardCount: 3 | 4 | 5 = 5, usedCards: string[] = []) {
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

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

export { getAllCards, genHands, genBoard };

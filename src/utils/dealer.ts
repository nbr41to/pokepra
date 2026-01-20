import {
  CARD_RANK_ORDER,
  CARD_RANKS,
  CARD_SUIT_ORDER,
  CARD_SUITS,
  getAllCards,
} from "@/utils/card";
import { genRandomInt, shuffleArray } from "./general";
import { getRangeStrengthByHand } from "./hand-range";
import { genPositionNumber } from "./position";

/**
 * ゲームの進行に関わるutils
 */

/**
 * すべてのカードをシャッフルしてゲームに使用するdeckを作成
 * @param excludes 使わないカードの配列
 */
function getShuffledDeck(excludes: string[] = []): string[] {
  const allCards = getAllCards().filter((card) => !excludes.includes(card));
  return shuffleArray(allCards);
}

/**
 * すべてのカードの順番が、RANKの強い順 > SUITの強い順になるように並び替え
 * @param cards カードの配列
 */
function sortCardsByRankAndSuit(cards: string[]): string[] {
  const suitOrder = (suit: string) => {
    switch (suit) {
      case "s":
        return CARD_SUIT_ORDER.SPADE;
      case "h":
        return CARD_SUIT_ORDER.HEART;
      case "d":
        return CARD_SUIT_ORDER.DIAMOND;
      case "c":
        return CARD_SUIT_ORDER.CLUB;
      default:
        return 0;
    }
  };

  return cards.sort((a, b) => {
    const rankDiff =
      (CARD_RANK_ORDER[b[0] ?? ""] ?? 0) - (CARD_RANK_ORDER[a[0] ?? ""] ?? 0);
    if (rankDiff !== 0) return rankDiff;
    return suitOrder(a[1] ?? "") - suitOrder(b[1] ?? "");
  });
}

/**
 * すべてのハンドの組み合わせを取得
 * @param excludes 除外するカードの配列
 */
function getAllCombos(excludes: string[] = []) {
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
 * ランダムにハンドを生成
 * [A, K, Q, T, 2 ~ 9] × [s, h, d, c] の組み合わせの2文字をランダムで返す
 * strength: TIERSの何番目までを含めるか (デフォルト: 0 -> 全て)
 * excludes: 除外するカードの配列
 */
function genHand(strength = 0, excludes: string[] = []) {
  let [hand1, hand2]: string[] = [];

  do {
    hand1 =
      CARD_RANKS[genRandomInt(CARD_RANKS.length)] +
      CARD_SUITS[genRandomInt(CARD_SUITS.length)];
    hand2 =
      CARD_RANKS[genRandomInt(CARD_RANKS.length)] +
      CARD_SUITS[genRandomInt(CARD_SUITS.length)];
  } while (
    hand1 === hand2 ||
    (strength !== 0 && getRangeStrengthByHand([hand1, hand2]) > strength) ||
    (strength !== 0 && getRangeStrengthByHand([hand1, hand2]) === -1) ||
    excludes.includes(hand1) ||
    excludes.includes(hand2)
  ); // strengthが指定されている場合、該当するtierに含まれるまで繰り返す

  return sortCardsByRankAndSuit([hand1, hand2]);
}

/**
 * カードを指定枚数ランダムに取得する
 * 主にボードカード生成に使用
 * ※ソートしないのでハンドに使用する際は注意
 */
const getRandomCards = (
  count: number = 5,
  excludes: string[] = [],
): string[] => {
  const allCards = getAllCards().filter((card) => !excludes.includes(card));
  const shuffled = shuffleArray(allCards);

  return shuffled.slice(0, count);
};

/**
 * 新しいゲームを開始する最初の準備
 */

function shuffleAndDeal(setting: {
  people: number;
  ignorePosition?: number[];
  heroStrength?: number;
  villainCount?: number;
}) {
  const {
    people,
    ignorePosition = [],
    heroStrength = 0,
    villainCount = 1,
  } = setting;

  const position = genPositionNumber(people, ignorePosition);
  const hero = genHand(heroStrength);
  const villains = Array.from({ length: villainCount }, () =>
    genHand(people, hero),
  ); // BBレンジ
  const deck = getShuffledDeck([...hero, ...villains.flat()]);

  return { position, hero, villains, deck, board: [] };
}

export {
  getShuffledDeck,
  getAllCards,
  getAllCombos,
  genHand,
  getRandomCards,
  shuffleAndDeal,
  sortCardsByRankAndSuit,
};

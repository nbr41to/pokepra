import { CARD_RANKS, CARD_SUITS, getAllCards } from "@/utils/card";
import { genRandomInt, shuffleArray } from "./general";
import { getRangeStrengthByHand } from "./hand-range";
import { genPositionNumber } from "./position";

/**
 * ゲームの進行に関わるutils
 */

/**
 * Deck
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
 * Hand
 */

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
 * [A, K, Q, T, 2 ~ 9]
 * [s, h, d, c]
 * の組み合わせの2文字をランダムで返す
 * includeTies: TIERSの何番目までを含めるか (デフォルト: 0 -> 全て)
 */
function genHands(strength = 0, excludes: string[] = []) {
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
    getRangeStrengthByHand([hand1, hand2]) === -1 ||
    excludes.includes(hand1) ||
    excludes.includes(hand2)
  ); // includeTiesが指定されている場合、該当するtierに含まれるまで繰り返す

  // rankの大きい順に並び替え
  const rankOrder = (rank: string) =>
    CARD_RANKS.indexOf(rank as (typeof CARD_RANKS)[number]);

  const handArray = [hand1, hand2].sort((a, b) => {
    return rankOrder(a[0]) - rankOrder(b[0]);
  });

  return handArray;
}

/**
 * Hand Rankの命名を省略形に変換する
 */
function getShortRankName(handName: string) {
  switch (handName) {
    case "High Card":
      return "HC";
    case "One Pair":
      return "1P";
    case "Pair":
      return "1P";
    case "Two Pair":
      return "2P";
    case "Three of a Kind":
      return "3K";
    case "Straight":
      return "ST";
    case "Flush":
      return "FL";
    case "Full House":
      return "FH";
    case "Four of a Kind":
      return "4K";
    case "Straight Flush":
      return "SF";
    default:
      return handName;
  }
}

/**
 * 新しいゲームを開始する最初の準備
 */

function shuffleAndDeal(setting: { people: number; heroStrength: number }) {
  const { people, heroStrength } = setting;

  const position = genPositionNumber(people);
  const hero = genHands(heroStrength);
  const villain = genHands(heroStrength, hero);
  const deck = getShuffledDeck([...hero, ...villain]);

  return { position, hero, villains: [villain], deck, board: [] };
}

export {
  getShuffledDeck,
  getAllCards,
  getAllCombos,
  genHands,
  getShortRankName,
  shuffleAndDeal,
};

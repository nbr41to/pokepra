import INITIAL_HAND_RANGES from "@/data/initial-hand-ranges.json";
import { CARD_RANK_ORDER, toHandArray } from "@/utils/card";
import { getAllCombos } from "./dealer";

/**
 * Hand Rangeに関するutils
 * HAND_RANGE_STRENGTHS はHand Rangeの強さを表す
 */

// internal
const HAND_RANGE_STRENGTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
function getSortedRank(hand1: string, hand2: string) {
  return [hand1[0], hand2[0]]
    .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
    .join("");
}
// internal
function getSuited(hand1: string, hand2: string) {
  return hand1[1] === hand2[1];
}

/**
 * レンジ表のハンドの文字列に変換する
 * @param hand string | string[]
 * 例: "As Kh" | ["As", "Kh"] -> "AKo"
 */
function toHandSymbol(hand: string | string[]) {
  const handArray = Array.isArray(hand) ? hand : toHandArray(hand);

  const rankString = getSortedRank(handArray[0], handArray[1]);
  const suited = getSuited(handArray[0], handArray[1]);
  return rankString[0] === rankString[1]
    ? rankString
    : rankString + (suited ? "s" : "o");
}

/**
 * Hand Rangeの2次元配列を返す
 * TODO: その打ち消したい
 */
function getInitialHandRangeArray() {
  return INITIAL_HAND_RANGES.map((range) => range.split(","));
}

/**
 * 指定したRange内のハンドをすべて取得
 * @param strength RANGE_STRENGTHSの値（1 〜 9）
 * @param exclude 除外するカードの配列
 */
function getHandsInRange(strength: number, exclude: string[] = []): string[][] {
  if (strength === -1) return [];
  if (strength < 1 || strength > HAND_RANGE_STRENGTHS.length) {
    throw new Error("Invalid strength value");
  }
  const allHands = getAllCombos(exclude);
  const allowedHandStrings = INITIAL_HAND_RANGES.slice(0, strength).flatMap(
    (str) => str.split(","),
  );

  return allHands.filter((hand) => {
    const handString = toHandSymbol(hand);
    return allowedHandStrings.includes(handString);
  });
}

/**
 * Hand Rangeの強さを返す
 * @param hand string | string[]
 * 例: "As Kh" | ["As", "Kh"]
 * @param ranges string[] optional
 */
function getRangeStrengthByHand(
  hand: string | string[],
  ranges = INITIAL_HAND_RANGES,
) {
  const handArray = Array.isArray(hand) ? hand : toHandArray(hand);
  const handSymbol = toHandSymbol(handArray);
  const strengthIndex = ranges.findIndex((range) => {
    const hands = range.split(",");
    return hands.includes(handSymbol);
  });

  return strengthIndex;
}

/**
 * Positionから対応するHAND_RANGE_STRENGTHSを返す
 */
function getRangeStrengthByPosition(position: number, people: number = 9) {
  const preflopPosition = [8, 9, 1, 2, 3, 4, 5, 6, 7]; // TODO: 動的なpeople対応
  const rangeStrengthRank = preflopPosition[position - 1];
  // SB(people - 1) を除外した 1-based seat number を受け取る
  if (people < 2 || people > 9) return -1;
  if (position < 1 || position > people) return -1;
  if (position === 1) return -1; // SB は対象外
  if (rangeStrengthRank < 1 || rangeStrengthRank > people) return -1;

  // position をもとに Tier Index を引く (9max 想定)
  const afterPositions = people - rangeStrengthRank;

  // SB を除外するため afterPositions が people - 1 になるパターンはスキップされている
  const positionToTierIndexes = [7, 7, 7, 6, 5, 5, 4, 4, 3];
  const strength = positionToTierIndexes[afterPositions];
  if (typeof strength !== "number") {
    return -1;
  }

  return strength;
}

function judgeInRange(hands: string[], position: number, people = 9) {
  const tierIndex = getRangeStrengthByPosition(position, people);
  const tierIndexes = Array.from({ length: tierIndex }, (_, i) => i);
  const openRaiseHands = tierIndexes.flatMap(
    (index) => getInitialHandRangeArray()[index],
  );
  const handString = toHandSymbol(hands);

  return openRaiseHands.includes(handString);
}

/** 用途検討 */
const _HAND_RANGE_SYMBOLS = [
  "QQ+,AKo,AKs",
  "99+,ATs+,AQo+,KQs",
  "77+,ATs+,AJo+,KJs+,QJ-JTs,KQo",
  "55+,A2s+,K9s+,ATo+,QTs+,KJo+,JT-T9s",
  "22+,A2s+,A9o+,K9s+,Q9s+,KTo+,J9s+,T8s+,QJ-JTo,98s",
  "22+,A2s+,K2s+,A7o+,Q6s+,J7s+,K9o+,Q9o+,T8s+,97s+,J9o+,87-65s,T9o",
  "22+,A2s+,K2s+,Q2s+,A6o+,J6s+,K9o+,Q9o+,T7s+,96s+,J9o+,86s+,75s+,64s+,T9-98o,54s",
  "22+,A2s+,A2o+,K2s+,Q2s+,J2s+,K5o+,T3s+,Q7o+,95s+,85s+,74s+,63s+,J8o+,53s+,T8o+,97o+,87o,43s",
];

export {
  getInitialHandRangeArray,
  getHandsInRange,
  getRangeStrengthByPosition,
  getRangeStrengthByHand,
  toHandSymbol,
  judgeInRange,
};

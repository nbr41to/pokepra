/**
 * Positionに関するutils
 *
 * 3〜9人:
 * UTG, 0 ~ 6, BTN, SB, BB（1 ~ 6 は +1, +2, ... と表記）
 * 2人: BTN/SB, BB
 *
 * Positionは 1 〜 maxPeople の数字で表す（maxPeopleがBTN）
 */

import { genRandomInt } from "./general";

const MIN_PEOPLE = 2;
const MAX_PEOPLE = 9;

/**
 * maxPeopleがBTNとして、Positionの数字をランダムに生成する
 * @param maxPeople 最大人数 (2~9)
 */
function genPositionNumber(maxPeople: number, excludes: number[] = []) {
  if (maxPeople < MIN_PEOPLE || maxPeople > MAX_PEOPLE) {
    throw new Error("genPositionNumber: maxPeopleは2~9の間で指定してください");
  }
  let position: number;
  do {
    position = genRandomInt(maxPeople) + 1;
  } while (excludes.includes(position));

  return position;
}

/**
 * PositionNumberからPositionの文字列を返す
 * @param positionNumber ポジション番号 (1 ~ maxPeople)
 * @param maxPeople 最大人数 (2~9)
 * 例: UTG, +1, +2, BTN, SB, BB
 * ※ maxPeople は BTN の位置を指す
 */
function getPositionLabel(positionNumber: number, maxPeople: number) {
  if (maxPeople < MIN_PEOPLE || maxPeople > MAX_PEOPLE) {
    throw new Error("getPositionLabel: maxPeopleは2~9の間で指定してください");
  }
  if (positionNumber < 1 || positionNumber > maxPeople) {
    throw new Error(
      "getPositionLabel: positionNumberは1~maxPeopleの間で指定してください",
    );
  }

  if (maxPeople === 2) {
    // 2人の場合
    return positionNumber === 1 ? "BB" : "BTN/SB";
  } else {
    // 3人以上の場合
    if (positionNumber === maxPeople) return "BTN";
    if (positionNumber === 1) return "SB";
    if (positionNumber === 2) return "BB";
    if (positionNumber === 3) return "UTG";

    return `+${(positionNumber - 3).toString()}`;
  }
}

export { genPositionNumber, getPositionLabel };

/**
 * 最高9人
 * UTG, 7 ~ 3, BTN, BB
 * SBなし
 */

/**
 * UTGを1として、Positionの数字を返す
 */
function genPositionNumber(maxPeople: number) {
  if (maxPeople < 2 || maxPeople > 9) {
    throw new Error("genPositionNumber: maxPeopleは2~9の間で指定してください");
  }
  return Math.floor(Math.random() * maxPeople) + 1;
}

/**
 * PositionNumberからPositionの文字列を返す
 * 例: UTG, +1, +2, BTN, SB, BB
 */
function getPositionString(positionNumber: number, maxPeople: number) {
  if (maxPeople < 2 || maxPeople > 9) {
    throw new Error("getPositionString: maxPeopleは2~9の間で指定してください");
  }
  if (positionNumber < 1 || positionNumber > maxPeople) {
    throw new Error(
      "getPositionString: positionNumberは1~maxPeopleの間で指定してください",
    );
  }

  if (positionNumber === maxPeople - 2) {
    return "SB";
  } else if (positionNumber === maxPeople - 1) {
    return "BB";
  } else if (positionNumber === maxPeople) {
    return `BTN${maxPeople === 2 ? "\nSB" : ""}`;
  } else if (positionNumber === 1) {
    return "UTG";
  } else {
    return `+${positionNumber - 1}`;
  }
}

export { genPositionNumber, getPositionString };

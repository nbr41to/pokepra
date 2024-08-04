/* 次のPositionを算出 */

const toFaceCardString = (number: number) => {
  if (number === 10) return "T";
  if (number === 11) return "J";
  if (number === 12) return "Q";
  if (number === 13) return "K";
  if (number === 14) return "A";

  return number.toString();
};

export const toHandString = (hand: Hand["preflop"]) => {
  const replacedHand = hand.map((number) => {
    if (number === 1) return 14;
    return number;
  }) as Hand["preflop"];
  const orderedNumbers = [replacedHand[0], replacedHand[1]].sort(
    (a, b) => b - a,
  );

  if (orderedNumbers[0] === orderedNumbers[1]) {
    return `${toFaceCardString(orderedNumbers[0])}${toFaceCardString(orderedNumbers[1])}`;
  }

  return `${toFaceCardString(orderedNumbers[0])}${toFaceCardString(orderedNumbers[1])}${
    hand[2] ? "s" : "o"
  }`;
};

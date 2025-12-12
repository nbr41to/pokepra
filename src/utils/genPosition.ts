/**
 * 最高9人
 * UTG, 7 ~ 3, BTN, BB
 * SBなし
 */

export function genPosition() {
  const positions = ["UTG", "B7", "B6", "B5", "B4", "B3", "BTN", "BB"] as const;

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  const position = positions[getRandomInt(positions.length)];

  return position;
}

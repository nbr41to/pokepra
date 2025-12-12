/**
 * [A, K, Q, T, 2 ~ 9]
 * [s, h, d, c]
 * の組み合わせの2文字をランダムで返す
 */
export function genHands() {
  const ranks = [
    "A",
    "K",
    "Q",
    "J",
    "T",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
  ] as const;
  const suits = ["s", "h", "d", "c"] as const;

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  const hand1 =
    ranks[getRandomInt(ranks.length)] + suits[getRandomInt(suits.length)];
  let hand2 =
    ranks[getRandomInt(ranks.length)] + suits[getRandomInt(suits.length)];

  // hand1とhand2が被らないようにする
  while (hand1 === hand2) {
    hand2 =
      ranks[getRandomInt(ranks.length)] + suits[getRandomInt(suits.length)];
  }

  return [hand1, hand2];
}

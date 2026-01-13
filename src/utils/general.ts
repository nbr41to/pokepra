/**
 * どこにも属さないutil関数群
 */

/**
 * 指定した数字の範囲内で整数をランダムに生成
 * @param max 生成する乱数の最大値（0 ~ max-1）
 */
function genRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * 配列をシャッフル
 * @param array T[]
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { genRandomInt, shuffleArray };

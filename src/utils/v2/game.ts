/**
 * game.ts
 * ポーカーに関する定義
 */

import { assertValidCardId, type CardId } from "./card";
import { type Combo, comboToRangeIndex, type Range } from "./combo";

/**
 * Rank
 * ポーカーの役カテゴリ。値が大きいほど強い役。
 * rs-poker の Rank enum と並びを揃えている。
 * ロイヤルフラッシュは「最強のストレートフラッシュ」として表現するため、
 * 専用のカテゴリは持たない。
 */
export const RANK = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
} as const;
export type Rank = (typeof RANK)[keyof typeof RANK];

/**
 * 52枚のカードからcomboを生成する
 * range がある場合は ComboClass ごとの頻度（0 ~ 1000）を重みとして抽選する。
 * ignore に含まれるカードを使う Combo は候補から除外する。
 */
export function generateCombo(conditions?: {
  range?: Range;
  ignore?: CardId | CardId[];
}): Combo {
  const ignored = new Set(
    conditions?.ignore === undefined
      ? []
      : Array.isArray(conditions.ignore)
        ? conditions.ignore
        : [conditions.ignore],
  );
  const weighted: { combo: Combo; weight: number }[] = [];

  for (let a = 0; a < 51; a++) {
    assertValidCardId(a);
    if (ignored.has(a)) continue;
    for (let b = a + 1; b < 52; b++) {
      assertValidCardId(b);
      if (ignored.has(b)) continue;
      const combo: Combo = [b, a];
      const weight = conditions?.range?.[comboToRangeIndex(combo)] ?? 1000;
      if (weight > 0) weighted.push({ combo, weight });
    }
  }

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of weighted) {
    r -= item.weight;
    if (r < 0) return item.combo;
  }
  throw new RangeError("No Combo can be generated from the conditions");
}

/**
 * ボードに表示されるカードを抽選
 * count は必要なカード枚数（フロップ=3、ターン=4、リバー=5）
 * ignore に含まれるカードは候補から除外する。
 */
export function generateBoard(
  conditions: { count?: number; ignore?: CardId | CardId[] } = {},
): CardId[] {
  const count = conditions.count ?? 5;
  if (!Number.isInteger(count) || count < 0 || count > 5) {
    throw new RangeError(
      `Board count must be an integer in [0, 5], got ${count}`,
    );
  }

  const ignored = new Set(
    conditions.ignore === undefined
      ? []
      : Array.isArray(conditions.ignore)
        ? conditions.ignore
        : [conditions.ignore],
  );
  const candidates: CardId[] = [];
  for (let id = 0; id < 52; id++) {
    assertValidCardId(id);
    if (!ignored.has(id)) candidates.push(id);
  }
  if (candidates.length < count) {
    throw new RangeError("Not enough cards to generate the board");
  }

  const board: CardId[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * candidates.length);
    board.push(candidates[idx]);
    candidates[idx] = candidates[candidates.length - 1];
    candidates.pop();
  }
  return board;
}

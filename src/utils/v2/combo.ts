import {
  type CardId,
  suitOfId,
  VALUE_CHARS,
  type ValueChar,
  valueOfId,
} from "./card";
/**
 * combo.ts
 * プレイヤーの手札（2枚のカードの組み合わせ）に関する定義。
 *
 * 命名について:
 * - ポーカーでは「hand」が「手札（2枚）」と「最終的に成立した役（5枚）」の
 *   両方を指して曖昧になるため、本プロジェクトでは前者を Combo と呼ぶ。
 */

/**
 * Combo
 * プレイヤーの手札（2枚のカードの組み合わせ）。
 * Card クラスをラップせず CardId 2枚のタプルで保持する。
 * パフォーマンスと WASM 受け渡しの都合上、
 * オブジェクト/クラスではなくプレーンな数値タプルとして扱う。
 *
 * 慣習として combo[0] >= combo[1] となるよう降順正規化する。
 */
export type Combo = readonly [CardId, CardId];

/**
 * ComboClass
 * レンジ表に使用される 169 種類のコンボ記号。
 * - Pair    : "AA", "KK", ..., "22"      (13通り)
 * - Suited  : "AKs", "AQs", ..., "32s"   (78通り)
 * - Offsuit : "AKo", "AQo", ..., "32o"   (78通り)
 *
 * 文字列上は「高い方の value を先に書く」慣習に従う（"AKs" であり "KAs" ではない）。
 */
export type Pair = `${ValueChar}${ValueChar}`;
export type Suited = `${ValueChar}${ValueChar}s`;
export type Offsuit = `${ValueChar}${ValueChar}o`;
export type ComboClass = Pair | Suited | Offsuit;

/**
 * Range
 * 13 × 13 = 169 のグリッドで表現するオープンレンジ。
 * 各セルはそのコンボクラスの選択頻度を表す（0 ~ 1000、0 = レンジに含まない）。
 *
 * グリッドのレイアウト:
 * - 行 = 12 - 高い方の value（A を行 0、2 を行 12 とする降順）
 * - 列 = 12 - 低い方の value
 * - row == col : ペア（対角線）
 * - row <  col : スーテッド（対角線の右上）
 * - row >  col : オフスート（対角線の左下）
 *
 * 配列インデックスは row * 13 + col。
 */
export type Range = Uint16Array;

export const RANGE_DIM = 13;
export const RANGE_SIZE = RANGE_DIM * RANGE_DIM;
export const COMBO_CLASS_RANKS = [...VALUE_CHARS].reverse() as ValueChar[];

/** 全要素 0 で初期化された Range を生成する。 */
export function createRange(): Range {
  return new Uint16Array(RANGE_SIZE);
}

/**
 * Combo を ComboClass に変換する。
 * VALUE_CHARS は昇順（0="2", ..., 12="A"）なので、Value enum をそのまま index に使える。
 */
export function toComboClass(combo: Combo): ComboClass {
  const v0 = valueOfId(combo[0]);
  const v1 = valueOfId(combo[1]);
  const hi = VALUE_CHARS[Math.max(v0, v1)];
  const lo = VALUE_CHARS[Math.min(v0, v1)];

  if (v0 === v1) return `${hi}${hi}` as Pair;
  return suitOfId(combo[0]) === suitOfId(combo[1])
    ? (`${hi}${lo}s` as Suited)
    : (`${hi}${lo}o` as Offsuit);
}

/**
 * ComboClass を Range のインデックス（0 ~ 168）に変換する。
 * `indexOf` は O(13) だが、この関数はユーザー入力のパースなど呼び出し頻度の低い経路用。
 * ホットパスでは文字列を経由しない comboToRangeIndex を使う。
 */
export function comboClassToIndex(cc: ComboClass): number {
  // ascending value (0=2 ... 12=A) → 降順グリッド行/列 (0=A ... 12=2)
  const hi = 12 - VALUE_CHARS.indexOf(cc[0] as ValueChar);
  const lo = 12 - VALUE_CHARS.indexOf(cc[1] as ValueChar);
  if (cc.length === 2) return hi * RANGE_DIM + hi;
  return cc[2] === "s" ? hi * RANGE_DIM + lo : lo * RANGE_DIM + hi;
}

/** Range の 13x13 表示順に ComboClass を列挙する。 */
export function buildComboClassGrid(): ComboClass[] {
  return COMBO_CLASS_RANKS.flatMap((rowRank, rowIndex) =>
    COMBO_CLASS_RANKS.map((colRank, colIndex) => {
      if (rowRank === colRank) return `${rowRank}${rowRank}` as Pair;
      const hi = COMBO_CLASS_RANKS[Math.min(rowIndex, colIndex)];
      const lo = COMBO_CLASS_RANKS[Math.max(rowIndex, colIndex)];
      return `${hi}${lo}${colIndex > rowIndex ? "s" : "o"}` as ComboClass;
    }),
  );
}

/**
 * Combo を直接 Range のインデックス（0 ~ 168）に変換する。
 * ComboClass 文字列を経由しない高速版。
 * モンテカルロシミュレーションのような大量呼び出しを想定するパスではこちらを使う。
 */
export function comboToRangeIndex(combo: Combo): number {
  const v0 = valueOfId(combo[0]);
  const v1 = valueOfId(combo[1]);
  const hi = 12 - Math.max(v0, v1);
  const lo = 12 - Math.min(v0, v1);
  if (v0 === v1) return hi * RANGE_DIM + hi;
  return suitOfId(combo[0]) === suitOfId(combo[1])
    ? hi * RANGE_DIM + lo
    : lo * RANGE_DIM + hi;
}

type ParsedComboClass = {
  hi: ValueChar;
  lo: ValueChar;
  suitedness: "s" | "o" | null;
  raw: ComboClass;
};

const rankIndex = (rank: ValueChar) => COMBO_CLASS_RANKS.indexOf(rank);

function parseComboClass(raw: string): ParsedComboClass | null {
  const trimmed = raw.trim();
  if (trimmed.length < 2) return null;
  const suitedness = trimmed.length >= 3 ? trimmed.at(-1) : null;
  if (suitedness !== null && suitedness !== "s" && suitedness !== "o") {
    return null;
  }

  const r1 = trimmed[0] as ValueChar;
  const r2 = trimmed[1] as ValueChar;
  const r1Index = rankIndex(r1);
  const r2Index = rankIndex(r2);
  if (r1Index < 0 || r2Index < 0) return null;

  if (r1 === r2) {
    return { hi: r1, lo: r2, suitedness: null, raw: `${r1}${r2}` as Pair };
  }

  const [hi, lo] = r1Index < r2Index ? [r1, r2] : [r2, r1];
  return {
    hi,
    lo,
    suitedness,
    raw: `${hi}${lo}${suitedness ?? ""}` as ComboClass,
  };
}

const buildComboClass = (
  hi: ValueChar,
  lo: ValueChar,
  suitedness: "s" | "o" | null,
) => (hi === lo ? `${hi}${lo}` : `${hi}${lo}${suitedness ?? ""}`) as ComboClass;

function expandPlus(comboClass: ParsedComboClass): ComboClass[] {
  const hiIndex = rankIndex(comboClass.hi);
  const loIndex = rankIndex(comboClass.lo);
  if (hiIndex < 0 || loIndex < 0) return [];

  if (comboClass.hi === comboClass.lo) {
    const out: ComboClass[] = [];
    for (let index = hiIndex; index >= 0; index -= 1) {
      const rank = COMBO_CLASS_RANKS[index];
      out.push(`${rank}${rank}` as Pair);
    }
    return out;
  }

  if (comboClass.hi === "A") {
    const out: ComboClass[] = [];
    for (let index = 1; index <= loIndex; index += 1) {
      const lo = COMBO_CLASS_RANKS[index];
      out.push(buildComboClass(comboClass.hi, lo, comboClass.suitedness));
    }
    return out;
  }

  const gap = loIndex - hiIndex;
  if (gap === 1) {
    const out: ComboClass[] = [];
    for (let index = hiIndex; index >= 0; index -= 1) {
      const hi = COMBO_CLASS_RANKS[index];
      const lo = COMBO_CLASS_RANKS[index + gap];
      if (!lo) continue;
      out.push(buildComboClass(hi, lo, comboClass.suitedness));
    }
    return out;
  }

  const out: ComboClass[] = [];
  for (let index = loIndex; index > hiIndex; index -= 1) {
    const lo = COMBO_CLASS_RANKS[index];
    out.push(buildComboClass(comboClass.hi, lo, comboClass.suitedness));
  }
  return out;
}

/** `"QQ+,A5s+,KQs-JTs"` のようなレンジ文字列を ComboClass に展開する。 */
export function expandComboClasses(range: string): ComboClass[] {
  const tokens = range
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const expanded: ComboClass[] = [];

  for (const token of tokens) {
    if (token.includes("-")) {
      const [startRaw, endRaw] = token.split("-", 2).map((part) => part.trim());
      const start = parseComboClass(startRaw);
      const end = parseComboClass(endRaw ?? "");
      if (!start || !end) continue;

      if (start.hi === start.lo && end.hi === end.lo) {
        const startIndex = rankIndex(start.hi);
        const endIndex = rankIndex(end.hi);
        const [from, to] =
          startIndex <= endIndex
            ? [startIndex, endIndex]
            : [endIndex, startIndex];
        for (let index = from; index <= to; index += 1) {
          const rank = COMBO_CLASS_RANKS[index];
          expanded.push(`${rank}${rank}` as Pair);
        }
        continue;
      }

      const startGap = rankIndex(start.lo) - rankIndex(start.hi);
      const endGap = rankIndex(end.lo) - rankIndex(end.hi);
      if (
        startGap !== endGap ||
        start.suitedness !== end.suitedness ||
        startGap <= 0
      ) {
        continue;
      }
      const startIndex = rankIndex(start.hi);
      const endIndex = rankIndex(end.hi);
      const [from, to] =
        startIndex <= endIndex
          ? [startIndex, endIndex]
          : [endIndex, startIndex];
      for (let index = from; index <= to; index += 1) {
        const hi = COMBO_CLASS_RANKS[index];
        const lo = COMBO_CLASS_RANKS[index + startGap];
        if (!lo) continue;
        expanded.push(buildComboClass(hi, lo, start.suitedness));
      }
      continue;
    }

    if (token.endsWith("+")) {
      const base = parseComboClass(token.slice(0, -1));
      if (base) expanded.push(...expandPlus(base));
      continue;
    }

    const parsed = parseComboClass(token);
    if (parsed) expanded.push(parsed.raw);
  }

  return expanded;
}

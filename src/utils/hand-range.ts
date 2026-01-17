import INITIAL_HAND_RANGES from "@/data/initial-hand-ranges.json";
import { CARD_RANK_ORDER, CARD_RANKS, toHandArray } from "@/utils/card";
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

type HandCode = {
  hi: string;
  lo: string;
  suitedness: "s" | "o" | null;
  raw: string;
};

const rankIndex = (rank: string) =>
  CARD_RANKS.indexOf(rank as (typeof CARD_RANKS)[number]);

const parseHandCode = (raw: string): HandCode | null => {
  const trimmed = raw.trim();
  if (trimmed.length < 2) return null;
  const suitedness = trimmed.length >= 3 ? (trimmed.at(-1) as "s" | "o") : null;
  if (suitedness && suitedness !== "s" && suitedness !== "o") return null;
  const ranks = trimmed.slice(0, 2);
  if (ranks.length !== 2) return null;
  const r1 = ranks[0];
  const r2 = ranks[1];
  if (rankIndex(r1) < 0 || rankIndex(r2) < 0) return null;
  if (r1 === r2) {
    return { hi: r1, lo: r2, suitedness: null, raw: `${r1}${r2}` };
  }
  const [hi, lo] = rankIndex(r1) < rankIndex(r2) ? [r1, r2] : [r2, r1];
  return {
    hi,
    lo,
    suitedness,
    raw: suitedness ? `${hi}${lo}${suitedness}` : `${hi}${lo}`,
  };
};

const buildHandCode = (hi: string, lo: string, suitedness: "s" | "o" | null) =>
  hi === lo ? `${hi}${lo}` : `${hi}${lo}${suitedness ?? ""}`;

const expandPlus = (hand: HandCode): string[] => {
  const hiIdx = rankIndex(hand.hi);
  const loIdx = rankIndex(hand.lo);
  if (hiIdx < 0 || loIdx < 0) return [];
  if (hand.hi === hand.lo) {
    const out: string[] = [];
    for (let i = hiIdx; i >= 0; i -= 1) {
      const r = CARD_RANKS[i];
      out.push(`${r}${r}`);
    }
    return out;
  }
  if (hand.hi === "A") {
    const out: string[] = [];
    for (let i = loIdx; i < CARD_RANKS.length; i += 1) {
      const lo = CARD_RANKS[i];
      if (!lo || lo === "A") continue;
      out.push(buildHandCode(hand.hi, lo, hand.suitedness));
    }
    return out;
  }
  const gap = loIdx - hiIdx;
  if (gap === 1) {
    const out: string[] = [];
    for (let i = hiIdx; i >= 0; i -= 1) {
      const hi = CARD_RANKS[i];
      const lo = CARD_RANKS[i + gap];
      if (!hi || !lo) continue;
      out.push(buildHandCode(hi, lo, hand.suitedness));
    }
    return out;
  }
  const out: string[] = [];
  for (let i = loIdx; i > hiIdx; i -= 1) {
    const lo = CARD_RANKS[i];
    out.push(buildHandCode(hand.hi, lo, hand.suitedness));
  }
  return out;
};

/**
 * スターティングハンドをレンジ文字列に圧縮する
 */
function compressStartingHands(hands: string[]) {
  const normalized = new Set<string>();
  for (const raw of hands) {
    const parsed = parseHandCode(raw);
    if (parsed) normalized.add(parsed.raw);
  }

  const tokens: string[] = [];

  const pairRanks = CARD_RANKS.filter((r) => normalized.has(`${r}${r}`));
  const pairIndexes = pairRanks.map(rankIndex).sort((a, b) => a - b);
  let i = 0;
  while (i < pairIndexes.length) {
    const start = pairIndexes[i];
    let end = start;
    while (
      i + 1 < pairIndexes.length &&
      pairIndexes[i + 1] === pairIndexes[i] + 1
    ) {
      i += 1;
      end = pairIndexes[i];
    }
    if (end !== start) {
      const high = CARD_RANKS[start];
      const low = CARD_RANKS[end];
      if (start === 0) {
        tokens.push(`${low}${low}+`);
      } else {
        tokens.push(`${high}${high}-${low}${low}`);
      }
      for (let idx = start; idx <= end; idx += 1) {
        const r = CARD_RANKS[idx];
        normalized.delete(`${r}${r}`);
      }
    }
    i += 1;
  }

  for (const r of CARD_RANKS) {
    const pair = `${r}${r}`;
    if (normalized.has(pair)) {
      tokens.push(pair);
      normalized.delete(pair);
    }
  }

  const nonPairs = Array.from(normalized)
    .map(parseHandCode)
    .filter(Boolean) as HandCode[];

  const plusCandidates = nonPairs
    .map((hand) => {
      const expanded = expandPlus(hand);
      return { hand, expanded };
    })
    .filter(
      (candidate) =>
        candidate.expanded.length > 1 &&
        candidate.expanded.every((code) => normalized.has(code)),
    )
    .sort((a, b) => b.expanded.length - a.expanded.length);

  for (const candidate of plusCandidates) {
    if (candidate.expanded.every((code) => normalized.has(code))) {
      tokens.push(`${candidate.hand.raw}+`);
      for (const code of candidate.expanded) {
        normalized.delete(code);
      }
    }
  }

  const remaining = Array.from(normalized)
    .map(parseHandCode)
    .filter(Boolean) as HandCode[];
  const groupKey = (hand: HandCode) => {
    const gap = rankIndex(hand.lo) - rankIndex(hand.hi);
    return `${hand.suitedness ?? ""}:${gap}`;
  };
  const grouped = new Map<string, HandCode[]>();
  for (const hand of remaining) {
    const key = groupKey(hand);
    const list = grouped.get(key) ?? [];
    list.push(hand);
    grouped.set(key, list);
  }

  for (const [key, group] of grouped.entries()) {
    const [suitednessRaw, gapRaw] = key.split(":");
    const suitedness =
      suitednessRaw === "" ? null : (suitednessRaw as "s" | "o");
    const gap = Number(gapRaw);
    const hiIndexes = group
      .map((hand) => rankIndex(hand.hi))
      .filter((idx) => idx >= 0)
      .sort((a, b) => a - b);
    let j = 0;
    while (j < hiIndexes.length) {
      const start = hiIndexes[j];
      let end = start;
      while (
        j + 1 < hiIndexes.length &&
        hiIndexes[j + 1] === hiIndexes[j] + 1
      ) {
        j += 1;
        end = hiIndexes[j];
      }
      if (end !== start) {
        const hiStart = CARD_RANKS[start];
        const loStart = CARD_RANKS[start + gap];
        const hiEnd = CARD_RANKS[end];
        const loEnd = CARD_RANKS[end + gap];
        if (hiStart && loStart && hiEnd && loEnd) {
          const token = suitedness
            ? `${hiStart}${loStart}${suitedness}-${hiEnd}${loEnd}${suitedness}`
            : `${hiStart}${loStart}-${hiEnd}${loEnd}`;
          const covered: string[] = [];
          for (let idx = start; idx <= end; idx += 1) {
            const hi = CARD_RANKS[idx];
            const lo = CARD_RANKS[idx + gap];
            if (!hi || !lo) continue;
            covered.push(buildHandCode(hi, lo, suitedness));
          }
          if (covered.every((code) => normalized.has(code))) {
            tokens.push(token);
            for (const code of covered) {
              normalized.delete(code);
            }
          }
        }
      }
      j += 1;
    }
  }

  const leftover = Array.from(normalized);
  leftover.sort((a, b) => {
    const pa = parseHandCode(a);
    const pb = parseHandCode(b);
    if (!pa || !pb) return a.localeCompare(b);
    if (pa.hi !== pb.hi) return rankIndex(pa.hi) - rankIndex(pb.hi);
    if (pa.lo !== pb.lo) return rankIndex(pa.lo) - rankIndex(pb.lo);
    return (pa.suitedness ?? "").localeCompare(pb.suitedness ?? "");
  });
  tokens.push(...leftover);

  return tokens.join(",");
}

/**
 * 圧縮されたレンジ文字列をスターティングハンドに展開する
 * @param range string
 * 例: "QQ+,KQs-JTs,A5s+" -> ["QQ","KK","AA","KQs","QJs","JTs","A5s","A4s","A3s","A2s"]
 */
function expandStartingHands(range: string): string[] {
  const tokens = range
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const expanded: string[] = [];

  for (const token of tokens) {
    if (token.includes("-")) {
      const [startRaw, endRaw] = token.split("-", 2).map((part) => part.trim());
      const start = parseHandCode(startRaw);
      const end = parseHandCode(endRaw ?? "");
      if (!start || !end) continue;

      if (start.hi === start.lo && end.hi === end.lo) {
        const startIdx = rankIndex(start.hi);
        const endIdx = rankIndex(end.hi);
        if (startIdx < 0 || endIdx < 0) continue;
        const [from, to] =
          startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        for (let idx = from; idx <= to; idx += 1) {
          const rank = CARD_RANKS[idx];
          expanded.push(`${rank}${rank}`);
        }
        continue;
      }

      const gapStart = rankIndex(start.lo) - rankIndex(start.hi);
      const gapEnd = rankIndex(end.lo) - rankIndex(end.hi);
      if (
        gapStart !== gapEnd ||
        start.suitedness !== end.suitedness ||
        gapStart <= 0
      ) {
        continue;
      }
      const startIdx = rankIndex(start.hi);
      const endIdx = rankIndex(end.hi);
      if (startIdx < 0 || endIdx < 0) continue;
      const [from, to] =
        startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
      for (let idx = from; idx <= to; idx += 1) {
        const hi = CARD_RANKS[idx];
        const lo = CARD_RANKS[idx + gapStart];
        if (!hi || !lo) continue;
        expanded.push(buildHandCode(hi, lo, start.suitedness));
      }
      continue;
    }

    if (token.endsWith("+")) {
      const base = parseHandCode(token.slice(0, -1));
      if (!base) continue;
      expanded.push(...expandPlus(base));
      continue;
    }

    const parsed = parseHandCode(token);
    if (parsed) {
      expanded.push(parsed.raw);
    }
  }

  return expanded;
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
 * @param position number
 * @param people number
 */
function getRangeStrengthByPosition(position: number, people: number = 9) {
  const preflopPosition = [8, 9, 1, 2, 3, 4, 5, 6, 7]; // TODO: 動的なpeople対応
  const rangeStrengthRank = preflopPosition[position - 1];
  // SB(people - 1) を除外した 1-based seat number を受け取る
  if (people < 2 || people > 9) return -1;
  if (position < 1 || position > people) return -1;
  // if (position === 1) return -1; // SB は対象外
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
  compressStartingHands,
  expandStartingHands,
  getInitialHandRangeArray,
  getHandsInRange,
  getRangeStrengthByPosition,
  getRangeStrengthByHand,
  toHandSymbol,
  judgeInRange,
};

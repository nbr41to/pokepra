"use client";

import { useMemo, useState } from "react";
import { RANK_ORDER, RANKS } from "@/constants/card";
import { parseRangeToHands } from "@/lib/wasm/simulation";
import { TIERS_RANGES } from "@/constants/tiers.range";
import { getHandString } from "@/utils/preflop-range";

const DEFAULT_RANGE = TIERS_RANGES[0] ?? "AA,KK,QQ,AKs,AKo";

const buildRangeUpToTier = (tier: number) => {
  const upperBound = Math.max(1, Math.min(tier, TIERS_RANGES.length));
  return TIERS_RANGES.slice(0, upperBound).join(",");
};
const PREVIEW_LIMIT = 40;

const formatHands = (hands: string[][], limit: number) =>
  hands
    .slice(0, limit)
    .map((pair) => pair.join(" "))
    .join(", ");

const rankIndex = (rank: string) =>
  RANKS.indexOf(rank as (typeof RANKS)[number]);

type HandCode = {
  hi: string;
  lo: string;
  suitedness: "s" | "o" | null;
  raw: string;
};

const parseHandCode = (raw: string): HandCode | null => {
  const trimmed = raw.trim();
  if (trimmed.length < 2) return null;
  const suitedness =
    trimmed.length >= 3 ? (trimmed.at(-1) as "s" | "o") : null;
  if (suitedness && suitedness !== "s" && suitedness !== "o") return null;
  const ranks = trimmed.slice(0, 2);
  if (ranks.length !== 2) return null;
  const r1 = ranks[0];
  const r2 = ranks[1];
  if (rankIndex(r1) < 0 || rankIndex(r2) < 0) return null;
  if (r1 === r2) {
    return { hi: r1, lo: r2, suitedness: null, raw: `${r1}${r2}` };
  }
  const [hi, lo] =
    rankIndex(r1) < rankIndex(r2) ? [r1, r2] : [r2, r1];
  return {
    hi,
    lo,
    suitedness,
    raw: suitedness ? `${hi}${lo}${suitedness}` : `${hi}${lo}`,
  };
};

const buildHandCode = (
  hi: string,
  lo: string,
  suitedness: "s" | "o" | null,
) => (hi === lo ? `${hi}${lo}` : `${hi}${lo}${suitedness ?? ""}`);

const expandPlus = (hand: HandCode): string[] => {
  const hiIdx = rankIndex(hand.hi);
  const loIdx = rankIndex(hand.lo);
  if (hiIdx < 0 || loIdx < 0) return [];
  if (hand.hi === hand.lo) {
    const out: string[] = [];
    for (let i = hiIdx; i >= 0; i -= 1) {
      const r = RANKS[i];
      out.push(`${r}${r}`);
    }
    return out;
  }
  const gap = loIdx - hiIdx;
  if (gap === 1) {
    const out: string[] = [];
    for (let i = hiIdx; i >= 0; i -= 1) {
      const hi = RANKS[i];
      const lo = RANKS[i + gap];
      if (!hi || !lo) continue;
      out.push(buildHandCode(hi, lo, hand.suitedness));
    }
    return out;
  }
  const out: string[] = [];
  for (let i = loIdx; i > hiIdx; i -= 1) {
    const lo = RANKS[i];
    out.push(buildHandCode(hand.hi, lo, hand.suitedness));
  }
  return out;
};

const compressStartingHands = (hands: string[]) => {
  const normalized = new Set<string>();
  for (const raw of hands) {
    const parsed = parseHandCode(raw);
    if (parsed) normalized.add(parsed.raw);
  }

  const tokens: string[] = [];

  const pairRanks = RANKS.filter((r) => normalized.has(`${r}${r}`));
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
      const high = RANKS[start];
      const low = RANKS[end];
      if (start === 0) {
        tokens.push(`${low}${low}+`);
      } else {
        tokens.push(`${high}${high}-${low}${low}`);
      }
      for (let idx = start; idx <= end; idx += 1) {
        const r = RANKS[idx];
        normalized.delete(`${r}${r}`);
      }
    }
    i += 1;
  }

  for (const r of RANKS) {
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
        const hiStart = RANKS[start];
        const loStart = RANKS[start + gap];
        const hiEnd = RANKS[end];
        const loEnd = RANKS[end + gap];
        if (hiStart && loStart && hiEnd && loEnd) {
          const token = `${hiStart}${loStart}-${hiEnd}${loEnd}${suitedness ?? ""}`;
          const covered: string[] = [];
          for (let idx = start; idx <= end; idx += 1) {
            const hi = RANKS[idx];
            const lo = RANKS[idx + gap];
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
};

export function Main() {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [tier, setTier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hands, setHands] = useState<string[][]>([]);
  const [simplifyLocked, setSimplifyLocked] = useState(false);

  const preview = useMemo(() => formatHands(hands, PREVIEW_LIMIT), [hands]);
  const rangeSet = useMemo(() => {
    return new Set(hands.map((hand) => getHandString(hand)));
  }, [hands]);

  const handleTierChange = (value: number) => {
    const next =
      value >= 1 && value <= TIERS_RANGES.length
        ? buildRangeUpToTier(value)
        : DEFAULT_RANGE;
    setTier(value);
    setRange(next);
    setSimplifyLocked(false);
  };

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const parsed = await parseRangeToHands({ range });
      setHands(parsed);
    } catch (err) {
      setHands([]);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSimplify = () => {
    setError(null);
    const codes = range
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    if (codes.length === 0) {
      setHands([]);
      setRange("");
      return;
    }
    setRange(compressStartingHands(codes));
    setSimplifyLocked(true);
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Tier
            <select
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
              value={tier}
              onChange={(event) => handleTierChange(Number(event.target.value))}
            >
              {TIERS_RANGES.map((_, idx) => (
                <option key={`tier-${idx + 1}`} value={idx + 1}>
                  Tier {idx + 1}
                </option>
              ))}
            </select>
          </label>
          <button
            className="rounded bg-black px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            onClick={handleParse}
            disabled={loading}
            type="button"
          >
            {loading ? "Parsing..." : "Parse Range"}
          </button>
          <button
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
            onClick={handleSimplify}
            disabled={loading || simplifyLocked}
            type="button"
          >
            {loading ? "Simplifying..." : "Simplify"}
          </button>
        </div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="range-input">
          Range (comma separated)
        </label>
        <textarea
          id="range-input"
          className="h-28 w-full resize-none rounded border border-gray-300 p-2 text-sm"
          value={range}
          onChange={(event) => {
            setRange(event.target.value);
            setSimplifyLocked(false);
          }}
        />
        <p className="text-xs text-gray-500">
          例: <span className="font-mono">AA,KK,AKs,AQo</span> /{" "}
          <span className="font-mono">99+,ATs+,AQo+</span>
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-800">Result</span>
          <span className="text-xs text-gray-500">
            count: {hands.length}
          </span>
        </div>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              preview ({Math.min(hands.length, PREVIEW_LIMIT)}):
            </p>
            <p className="break-words text-sm text-gray-800">
              {hands.length === 0 ? "-" : preview}
            </p>
          </>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-gray-800">Range Table</div>
        <div className="grid w-fit grid-cols-13 border-r border-b">
          {RANKS.map((_rank, rowIndex) => {
            const prefixRank = RANKS[rowIndex];
            return RANKS.map((rank, column) => {
              const orderedRanks = [prefixRank, rank]
                .sort((a, b) => RANK_ORDER[b] - RANK_ORDER[a])
                .join("");
              const ranksString =
                orderedRanks +
                (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
              const isActive = rangeSet.has(ranksString);
              return (
                <div
                  key={`${rank}-${column}`}
                  className={`grid h-5 w-full px-0.5 place-items-center border-t border-l text-[10px] ${
                    isActive ? "bg-emerald-500 text-white" : "text-foreground"
                  }`}
                >
                  {ranksString}
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import HAND_RANGES from "@/data/initial-hand-ranges.json";
import { parseRangeToHands } from "@/lib/wasm/simulation";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";
import { compressStartingHands, toHandSymbol } from "@/utils/hand-range";

const DEFAULT_RANGE = HAND_RANGES[0] ?? "AA,KK,QQ,AKs,AKo";

const buildRangeUpToTier = (tier: number) => {
  const upperBound = Math.max(1, Math.min(tier, HAND_RANGES.length));
  return HAND_RANGES.slice(0, upperBound).join(",");
};
const PREVIEW_LIMIT = 40;

const formatHands = (hands: string[][], limit: number) =>
  hands
    .slice(0, limit)
    .map((pair) => pair.join(" "))
    .join(", ");

export function Main() {
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [tier, setTier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hands, setHands] = useState<string[][]>([]);
  const [simplifyLocked, setSimplifyLocked] = useState(false);

  const preview = useMemo(() => formatHands(hands, PREVIEW_LIMIT), [hands]);
  const rangeSet = useMemo(() => {
    return new Set(hands.map((hand) => toHandSymbol(hand)));
  }, [hands]);

  const handleTierChange = (value: number) => {
    const next =
      value >= 1 && value <= HAND_RANGES.length
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
          <label className="font-medium text-gray-700 text-sm">
            Tier
            <select
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
              value={tier}
              onChange={(event) => handleTierChange(Number(event.target.value))}
            >
              {HAND_RANGES.map((_, idx) => (
                <option key={`tier-${idx + 1}`} value={idx + 1}>
                  Tier {idx + 1}
                </option>
              ))}
            </select>
          </label>
          <button
            className="rounded bg-black px-3 py-1.5 font-semibold text-sm text-white disabled:opacity-60"
            onClick={handleParse}
            disabled={loading}
            type="button"
          >
            {loading ? "Parsing..." : "Parse Range"}
          </button>
          <button
            className="rounded border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 text-sm disabled:opacity-60"
            onClick={handleSimplify}
            disabled={loading || simplifyLocked}
            type="button"
          >
            {loading ? "Simplifying..." : "Simplify"}
          </button>
        </div>
        <label
          className="block font-medium text-gray-700 text-sm"
          htmlFor="range-input"
        >
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
        <p className="text-gray-500 text-xs">
          例: <span className="font-mono">AA,KK,AKs,AQo</span> /{" "}
          <span className="font-mono">99+,ATs+,AQo+</span>
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-gray-800 text-sm">Result</span>
          <span className="text-gray-500 text-xs">count: {hands.length}</span>
        </div>
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : (
          <>
            <p className="text-gray-500 text-xs">
              preview ({Math.min(hands.length, PREVIEW_LIMIT)}):
            </p>
            <p className="break-words text-gray-800 text-sm">
              {hands.length === 0 ? "-" : preview}
            </p>
          </>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="font-semibold text-gray-800 text-sm">Range Table</div>
        <div className="grid w-fit grid-cols-13 border-r border-b">
          {CARD_RANKS.map((_rank, rowIndex) => {
            const prefixRank = CARD_RANKS[rowIndex];
            return CARD_RANKS.map((rank, column) => {
              const orderedRanks = [prefixRank, rank]
                .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
                .join("");
              const ranksString =
                orderedRanks +
                (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
              const isActive = rangeSet.has(ranksString);

              return (
                <div
                  key={ranksString}
                  className={`grid h-5 w-full place-items-center border-t border-l px-0.5 text-[10px] ${
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

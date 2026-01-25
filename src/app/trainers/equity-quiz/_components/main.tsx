"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Combo } from "@/components/combo";
import { HandProbability } from "@/components/hand-probability";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/shadcn/button";
import {
  simulateRankDistribution,
  simulateVsListEquity,
} from "@/lib/wasm/simulation";
import { getShuffledDeck } from "@/utils/dealer";
import { shuffleArray } from "@/utils/general";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";

const TRIALS = 1000;
const OFFSETS = [8, 16, 20, 24] as const;

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const roundPercent = (value: number) => Math.round(value * 10) / 10;

const buildOptions = (correct: number) => {
  const roundedCorrect = roundPercent(correct);
  const options = new Set<number>([roundedCorrect]);
  const shuffledOffsets = shuffleArray([...OFFSETS]);

  for (const offset of shuffledOffsets) {
    if (options.size >= 4) break;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const candidate = roundPercent(
      clampPercent(roundedCorrect + sign * offset),
    );
    if (!options.has(candidate)) {
      options.add(candidate);
    }
  }

  while (options.size < 4) {
    const fallback = roundPercent(
      clampPercent(roundedCorrect + (Math.random() > 0.5 ? 1 : -1) * 5),
    );
    options.add(fallback);
  }

  return shuffleArray(Array.from(options));
};

export function Main() {
  const [hero, setHero] = useState<string[]>([]);
  const [board, setBoard] = useState<string[]>([]);
  const [equity, setEquity] = useState<number | null>(null);
  const [rankResults, setRankResults] = useState<Record<string, number> | null>(
    null,
  );
  const [options, setOptions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const correctValue = useMemo(() => {
    if (equity === null) return null;
    return roundPercent(equity);
  }, [equity]);

  const loadScenario = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setError(null);
    setOptions([]);
    setEquity(null);
    setRankResults(null);

    try {
      const deck = getShuffledDeck();
      const heroHand = deck.slice(0, 2);
      const flopBoard = deck.slice(2, 5);
      const compare = getHandsByStrength(getRangeStrengthByPosition(2, 9), [
        ...heroHand,
        ...flopBoard,
      ]);

      setHero(heroHand);
      setBoard(flopBoard);

      const [result, distributions] = await Promise.all([
        simulateVsListEquity({
          hero: heroHand,
          board: flopBoard,
          compare,
          trials: TRIALS,
        }),
        simulateRankDistribution({
          hands: [heroHand],
          board: flopBoard,
          trials: TRIALS,
        }),
      ]);
      const nextEquity = clampPercent(result.equity * 100);
      setEquity(nextEquity);
      setOptions(buildOptions(nextEquity));
      const entry = distributions[0];
      if (entry?.results) {
        setRankResults(entry.results);
      }
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScenario();
  }, [loadScenario]);

  return (
    <div className="mt-auto w-full max-w-md space-y-6 pb-6">
      <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-muted-foreground text-sm/normal">
          以下のフロップの状況を見て、あなたの勝率はどれでしょう。ただし、対戦相手のレンジはBBとします。
        </p>
        <div className="flex flex-col items-center">
          <p className="text-muted-foreground text-xs">フロップ</p>
          <div className="flex items-center gap-2">
            {board.map((card) => (
              <PlayCard key={`board-${card}`} rs={card} size="sm" />
            ))}
          </div>
          <p className="mt-4 text-muted-foreground text-xs">あなたのハンド</p>
          <Combo hand={hero} className="" />
        </div>
      </div>

      <div className="grid h-21 grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = correctValue !== null && option === correctValue;
          return (
            <Button
              key={option}
              className={
                isSelected
                  ? isCorrect
                    ? "bg-emerald-500 text-white hover:bg-emerald-500"
                    : "bg-rose-500 text-white hover:bg-rose-500"
                  : ""
              }
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelected(option)}
              disabled={loading || options.length === 0}
            >
              {option.toFixed(1)}%
            </Button>
          );
        })}
      </div>

      <div className="h-36.5">
        {selected !== null && correctValue !== null && (
          <div className="rounded-xl border bg-card p-4 text-sm shadow-sm">
            <p>
              正解: <strong>{correctValue.toFixed(1)}%</strong>
            </p>
            <p className="text-muted-foreground text-xs">
              誤差: {(selected - correctValue).toFixed(1)}%
            </p>
            {rankResults && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "High Card",
                  "One Pair",
                  "Two Pair",
                  "Three of a Kind",
                  "Straight",
                  "Flush",
                  "Full House",
                  "Four of a Kind",
                  "Straight Flush",
                ]
                  .map((name) => {
                    const count = rankResults[name];
                    return { name, count };
                  })
                  .filter(({ count }) => typeof count === "number" && count > 0)
                  .map(({ name, count }) => {
                    const total = Object.values(rankResults).reduce(
                      (sum, value) => sum + value,
                      0,
                    );
                    const probability = total === 0 ? 0 : (count / total) * 100;
                    return (
                      <HandProbability
                        key={name}
                        handName={name}
                        probability={probability}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 text-muted-foreground text-xs">
        <span>{loading ? "計算中..." : "準備完了"}</span>
        <Button size="sm" variant="outline" onClick={loadScenario}>
          次の問題
        </Button>
      </div>
    </div>
  );
}

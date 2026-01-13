"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Combo } from "@/components/combo";
import { HandProbability } from "@/components/hand-probability";
import { InputCards } from "@/components/input-cards";
import { InputHands } from "@/components/input-hands";
import { SetRangeHands } from "@/components/set-range-hands";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import RANKING from "@/data/preflop-hand-ranking.json";
import {
  type RankDistributionEntry,
  simulateRankDistributionWithProgress,
} from "@/lib/wasm/simulation";
import { toHandSymbol } from "@/utils/hand-range";

const HAND_RARITY = {
  "Straight Flush": 0.0015,
  "Four of a Kind": 0.024,
  "Full House": 0.1441,
  Flush: 0.197,
  Straight: 0.3925,
  "Three of a Kind": 2.1128,
  "Two Pair": 4.7539,
  "One Pair": 42.2569,
  "High Card": 50.1177,
};
const TRIAL_ITERATE = 10000;

export function Main() {
  const params = useSearchParams();
  const initialBoard = params.get("board")?.replaceAll(",", " ") || "";

  const [board, setBoard] = useState(initialBoard);
  const [compare, setCompare] = useState(""); // ハンド ;区切り
  console.log(board);

  const splitCards = (val: string) => {
    if (!val) return [] as string[];
    const replaced = val.replaceAll(";", " ");

    return replaced
      .split(" ")
      .map((c) => c.trim())
      .filter(Boolean);
  };

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    (RankDistributionEntry & { score: number })[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = async () => {
    setError(null);
    setLoading(true);
    setProgress(0);

    try {
      const result = await simulateRankDistributionWithProgress({
        board: board.split(" "),
        hands: compare.split(";").map((hand) => hand.split(" ")),
        trials: TRIAL_ITERATE,
        onProgress: (pct) => {
          setProgress(pct);
        },
      });
      const resultWithScore = result.map((r) => ({
        ...r,
        score: Object.entries(r.results).reduce((score, [handName, count]) => {
          const rarity = HAND_RARITY[handName as keyof typeof HAND_RARITY] || 0;
          const rankEq =
            RANKING.find((h) => h.hand === toHandSymbol(r.hand.split(" ")))
              ?.player10 || 1;
          const K = 0.05; // ランク補正の調整用定数

          return score + (count * (100 - rarity)) / TRIAL_ITERATE + K * rankEq;
        }, 0),
      }));

      setResults(resultWithScore.sort((a, b) => b.score - a.score));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const getScore = () => {
    if (!results || results.length === 0) return 0;
    const score = results.reduce((sum, r) => {
      const handScore = Object.entries(r.results).reduce(
        (score, [handName, count]) => {
          const rarity = HAND_RARITY[handName as keyof typeof HAND_RARITY] || 0;
          const rankEq =
            RANKING.find((h) => h.hand === toHandSymbol(r.hand.split(" ")))
              ?.player10 || 1;
          const K = 0.05; // ランク補正の調整用定数

          return score + (count * (100 - rarity)) / TRIAL_ITERATE + K * rankEq;
        },
        0,
      );

      return sum + handScore;
    }, 0);

    return score / results.length;
  };

  const usedCards = [...splitCards(board), ...splitCards(compare)];

  return (
    <div className="w-full max-w-full space-y-3">
      <div className="space-y-2 pb-6">
        <div className="space-y-3">
          <Label>board (3 ~ 5)</Label>
          <InputCards
            value={board}
            onChange={setBoard}
            limit={5}
            banCards={usedCards}
          />
        </div>
        <div className="space-y-3">
          <Label>compare (2 ~)</Label>
          <InputHands
            value={compare}
            onChange={setCompare}
            limit={30}
            banCards={usedCards}
          />
        </div>
      </div>

      <div className="-mt-3">
        <p className="text-center text-xs">set range hands</p>
        <SetRangeHands total={9} setValue={setCompare} excludes={usedCards} />
      </div>

      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={runSimulation}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Simulation"}
      </Button>

      {/* Progress */}
      {loading ? (
        <div className="flex w-full justify-between gap-3">
          <Progress value={progress} className="h-3 grow" />
          <span className="text-muted-foreground text-sm tabular-nums">
            {progress.toFixed(0)}%
          </span>
        </div>
      ) : null}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}
      {results && (
        <div className="rounded-md border border-green-500/50 bg-green-100/10 px-3 py-2 text-green-700 text-sm">
          Score Ave: {getScore().toFixed(2)}
        </div>
      )}

      {results && (
        <div>
          {results.map(({ hand, score, results }) => (
            <div key={hand} className="">
              <div key={hand} className="flex items-center">
                <Combo hand={hand.split(" ")} className="scale-75" />
                <div>{score.toFixed(2)}</div>
              </div>
              <div className="flex h-full flex-wrap items-center gap-1 pl-2">
                {Object.keys(results)
                  .filter((name) => results[name as keyof typeof results] > 0)
                  .map((name) => {
                    const probability =
                      (results[name as keyof typeof results] / TRIAL_ITERATE) *
                      100;

                    return (
                      <HandProbability
                        key={name}
                        handName={name}
                        probability={probability}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

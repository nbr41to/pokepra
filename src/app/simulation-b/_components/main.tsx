"use client";

import { ListX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { Combo } from "@/components/combo";
import { HandProbability } from "@/components/hand-probability";
import { InputCardPalette } from "@/components/input-card-palette";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type RankDistributionEntry,
  simulateRankDistributionWithProgress,
} from "@/lib/wasm/simulation";
import { getHandsByTiers, getShuffledDeck } from "@/utils/dealer";

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
  const [target, setTarget] = useState<null | "hero" | "board" | "compare">(
    null,
  );
  const [board, setBoard] = useState(initialBoard);
  const [compare, setCompare] = useState(""); // ハンド ;区切り

  const splitCards = (val: string) => {
    if (!val) return [] as string[];
    const replaced = val.replaceAll(";", " ");

    return replaced
      .split(" ")
      .map((c) => c.trim())
      .filter(Boolean);
  };

  const updateTarget = (cards: string) => {
    if (target === "board") setBoard(cards);
    if (target === "compare") setCompare(cards);
  };

  const paletteValue =
    target === "board" ? board : target === "compare" ? compare : "";
  const paletteLimit =
    target === "board" ? 5 : target === "compare" ? 30 : undefined;

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    (RankDistributionEntry & { score: number })[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // palette外クリックで閉じる
  useEffect(() => {
    if (!target) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const palette = document.getElementById("input-card-palette");
      if (!palette) return;
      const targetNode = e.target as Node | null;
      if (targetNode && palette.contains(targetNode)) return;
      setTarget(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [target]);

  const runSimulation = async () => {
    setTarget(null);
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
          console.log(`simulation progress: ${pct.toFixed(2)}%`);
        },
      });
      const resultWithScore = result.map((r) => ({
        ...r,
        score: Object.entries(r.results).reduce((score, [handName, count]) => {
          const rarity = HAND_RARITY[handName as keyof typeof HAND_RARITY] || 0;

          return score + (count * (100 - rarity)) / TRIAL_ITERATE;
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

          return score + (count * (100 - rarity)) / TRIAL_ITERATE;
        },
        0,
      );

      return sum + handScore;
    }, 0);

    return score / results.length;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-8 overflow-scroll p-6">
      <h1 className="font-bold font-montserrat text-2xl">
        Monte Carlo Simulation
      </h1>
      <div className="w-full space-y-2">
        {loading ? (
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-3 grow" />
            <span className="min-w-[72px] text-muted-foreground text-sm tabular-nums">
              {progress.toFixed(0)}%
            </span>
          </div>
        ) : null}
        <div className="space-y-3">
          <Label>board</Label>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className={cn(
                "flex h-16 w-full flex-wrap items-center gap-1 rounded-md border px-4 py-2",
                target === "board" &&
                  "bg-green-200 ring-2 ring-green-400 ring-offset-2 ring-offset-background dark:bg-green-900 dark:ring-green-600",
              )}
              onClick={() => {
                setTarget("board");
              }}
            >
              {board ? (
                board
                  .split(" ")
                  .map((card) => (
                    <PlayCard key={card} rs={card} size="sm" className="w-8" />
                  ))
              ) : (
                <div className="text-sm">Select board Cards</div>
              )}
            </button>
            <Button size="icon-lg" variant="ghost" onClick={() => setBoard("")}>
              <ListX size={32} />
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label>compare</Label>
          <div className="relative flex items-center gap-x-1">
            <button
              type="button"
              className={cn(
                "flex h-16 w-full items-center gap-1 overflow-x-scroll rounded-md border px-4 py-2",
                target === "compare" &&
                  "bg-green-200 ring-2 ring-green-400 ring-offset-2 ring-offset-background dark:bg-green-900 dark:ring-green-600",
              )}
              onClick={() => {
                setTarget("compare");
              }}
            >
              {compare ? (
                compare.split("; ").map((hand, i) => (
                  <Fragment key={hand}>
                    {hand.split(" ").map((card) => (
                      <PlayCard
                        key={card}
                        rs={card}
                        size="sm"
                        className="w-8 shrink-0"
                      />
                    ))}
                    <span
                      className={cn(
                        "grid h-full place-content-end",
                        compare.split(";").length === i + 1 && "hidden",
                        hand.split(" ").length % 2 && "hidden",
                      )}
                    >
                      ,
                    </span>
                  </Fragment>
                ))
              ) : (
                <div className="text-sm">Select Compare Hands</div>
              )}
            </button>
            <Button
              size="icon-lg"
              variant="ghost"
              onClick={() => setCompare("")}
            >
              <ListX size={32} />
            </Button>
            {compare && (
              <div className="absolute right-14 -bottom-6 text-xs">
                ({compare.split("; ").length})
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        className="w-40"
        size="lg"
        onClick={runSimulation}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Simulation"}
      </Button>
      <Button
        className="w-40"
        size="lg"
        onClick={() => {
          const deck = getShuffledDeck();
          setBoard(deck.slice(0, 3).join(" "));
        }}
      >
        set random board
      </Button>
      <Button
        className="w-40"
        size="lg"
        onClick={() => {
          const allHands = getHandsByTiers(6, [...board.split(" ")]);
          const newCompare = allHands.join("; ").replaceAll(",", " ");
          setCompare(newCompare);
        }}
      >
        hand range of btn
      </Button>
      <Button
        className="w-40"
        size="lg"
        onClick={() => {
          const allHands = getHandsByTiers(1, [...board.split(" ")]);
          const newCompare = allHands.join("; ").replaceAll(",", " ");
          setCompare(newCompare);
        }}
      >
        hand range of utg
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}
      {results && (
        <div className="rounded-md border border-green-500/50 bg-green-100/10 px-3 py-2 text-green-700 text-sm">
          Score: {getScore().toFixed(2)}
        </div>
      )}
      {results && (
        <div>
          {results.map(({ hand, score, results }) => (
            <div key={hand} className="">
              <div key={hand} className="flex">
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

      {target && (
        <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center gap-x-1 bg-background p-2">
          <InputCardPalette
            key={target}
            value={paletteValue}
            limit={paletteLimit}
            handSeparator={target === "compare" ? ";" : null}
            banCards={[...splitCards(compare), ...splitCards(board)]}
            onChange={(val) => updateTarget(val)}
          />
        </div>
      )}
    </div>
  );
}

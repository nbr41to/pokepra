"use client";

import { useState } from "react";
import { Combo } from "@/components/combo";
import { HandProbability } from "@/components/hand-probability";
import { InputCards } from "@/components/input-cards";
import { InputHands } from "@/components/input-hands";
import { SetRangeHands } from "@/components/set-range-hands";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type simulateVsListWithRanks,
  simulateVsListWithRanksWithProgress,
} from "@/lib/wasm/simulation";
import { getHandsByTiers, getShuffledDeck } from "@/utils/dealer";

const splitCards = (val: string) => {
  if (!val) return [] as string[];
  const replaced = val.replaceAll(";", " ");

  return replaced
    .split(" ")
    .map((c) => c.trim())
    .filter(Boolean);
};

export function Main() {
  const [hero, setHero] = useState("");
  const [board, setBoard] = useState("");
  const [compare, setCompare] = useState(""); // 想定する相手のハンド ;区切り

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof simulateVsListWithRanks>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = async () => {
    setError(null);
    setLoading(true);
    setProgress(0);

    try {
      const result = await simulateVsListWithRanksWithProgress({
        hero: hero.split(" "),
        board: board.split(" "),
        compare: compare.split("; ").map((hand) => hand.split(" ")),
        trials: 1000,
        onProgress: (pct) => setProgress(pct),
      });

      setResult(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const usedCards = [
    ...splitCards(hero),
    ...splitCards(board),
    ...splitCards(compare),
  ];

  return (
    <div className="w-full space-y-3">
      <div className="space-y-2 pb-6">
        <div className="space-y-3">
          <Label>hero (2)</Label>
          <InputCards
            value={hero}
            onChange={setHero}
            limit={2}
            banCards={usedCards}
          />
        </div>
        <div className="space-y-3">
          <Label>board (0 ~ 5)</Label>
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
            banCards={usedCards}
          />
        </div>
      </div>

      <div className="-mt-3">
        <p className="text-center text-xs">set range hands</p>
        <SetRangeHands total={9} setValue={setCompare} excludes={usedCards} />
      </div>
      <Button
        size="lg"
        onClick={() => {
          const deck = getShuffledDeck();

          setHero(deck.slice(0, 2).join(" "));
          setBoard(deck.slice(2, 5).join(" "));

          const allHands = getHandsByTiers(6, deck.slice(0, 5));
          const newCompare = allHands.join("; ").replaceAll(",", " ");
          setCompare(newCompare);
        }}
      >
        set test values
      </Button>

      <div className="flex">
        <Button
          className="w-full rounded-full"
          variant="outline"
          size="lg"
          onClick={runSimulation}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Simulation"}
        </Button>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Progress */}
      {loading ? (
        <div className="flex w-full justify-between gap-3">
          <Progress value={progress} className="h-3 grow" />
          <span className="text-muted-foreground text-sm tabular-nums">
            {progress.toFixed(0)}%
          </span>
        </div>
      ) : null}

      {/* Results */}
      {result && (
        <div className="space-y-1">
          <div>{result.data.length} combos</div>
          <div className="divide-y">
            {result.data.map(
              ({ hand, win, tie, lose, count, results }, index) => {
                const equity = ((win + tie / 2) / count) * 100;

                return (
                  <div
                    key={hand}
                    className={cn(
                      "space-y-1 px-2 py-1",
                      result.hand === hand &&
                        "bg-orange-200 dark:bg-orange-900",
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <div>
                        {index + 1}.
                        <span className="text-xs">
                          (
                          {(((index + 1) / result.data.length) * 100).toFixed(
                            1,
                          )}
                          %)
                        </span>
                      </div>
                      <Combo className="scale-80" hand={hand.split(" ")} />
                      <div className="text-lg/[1]">
                        {equity.toFixed(2)}%
                        <br />
                        <p className="text-sm">
                          (win: {win}, tie: {tie}, lose: {lose})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {Object.keys(results)
                        .filter((name) => {
                          const outcome = results[name as keyof typeof results];
                          return outcome.win + outcome.tie > 0;
                        })
                        .map((name) => {
                          const outcome = results[name as keyof typeof results];
                          const total = outcome.win + outcome.tie;
                          const probability = (total / count) * 100;

                          return (
                            <HandProbability
                              key={name}
                              className=""
                              handName={name}
                              probability={probability}
                            />
                          );
                        })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
}

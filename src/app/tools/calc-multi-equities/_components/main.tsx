"use client";

import { useState } from "react";
import { InputBoard } from "@/components/input-board";
import { InputCards } from "@/components/input-cards";
import { InputHands } from "@/components/input-hands";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Progress } from "@/components/shadcn/progress";
import { simulateMultiHandEquityWithProgress } from "@/lib/wasm/simulation";
import { ResultsPieChart } from "./results-pie-chart";

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
    ReturnType<typeof simulateMultiHandEquityWithProgress>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = async () => {
    setError(null);
    setLoading(true);
    setProgress(0);

    try {
      const heroHands = hero.split(" ");
      const compareHands = compare.split("; ").map((hand) => hand.split(" "));
      const result = await simulateMultiHandEquityWithProgress({
        hands: [heroHands, ...compareHands],
        board: board.split(" "),
        trials: 10000,
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
        <div className="space-y-2">
          <Label className="font-bold">
            <span>
              あなたのハンド<span className="text-muted-foreground">*</span>
              （2枚のみ）
            </span>
          </Label>
          <InputCards
            value={hero}
            onChange={setHero}
            limit={2}
            banCards={usedCards}
          />
          <Label className="font-bold">ボード（0 ~ 5枚）</Label>
          <InputBoard
            value={board}
            onChange={setBoard}
            limit={5}
            banCards={usedCards}
          />
          <Label className="font-bold">
            <span>
              相手のハンド
              <span className="text-muted-foreground">*</span>（2枚以上）
            </span>
          </Label>
          <InputHands
            value={compare}
            onChange={setCompare}
            banCards={usedCards}
            limit={10}
          />
        </div>
      </div>

      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={runSimulation}
        disabled={
          loading ||
          splitCards(hero).length !== 2 ||
          splitCards(compare).length < 1
        }
      >
        {loading ? "Running..." : "Run Simulation"}
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}

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
      {result && <ResultsPieChart data={result.data} heroHand={hero} />}
    </div>
  );
}

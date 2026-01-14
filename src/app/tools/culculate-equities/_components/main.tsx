"use client";

import { GalleryVertical, GalleryVerticalEnd } from "lucide-react";
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

const splitCards = (val: string) => {
  if (!val) return [] as string[];
  const replaced = val.replaceAll(";", " ");

  return replaced
    .split(" ")
    .map((c) => c.trim())
    .filter(Boolean);
};

type Props = {
  hero?: string;
  board?: string;
};
export function Main({
  hero: initialHero = "",
  board: initialBoard = "",
}: Props) {
  const [hero, setHero] = useState(initialHero);
  const [board, setBoard] = useState(initialBoard);
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
  const rangeExcludes = [...splitCards(hero), ...splitCards(board)];

  const scrollToMyHand = (smooth = false) => {
    const element = document.getElementById(hero);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };
  const scrollToTop = (smooth = false) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  };

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
          <InputCards
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
          />
        </div>
      </div>

      <div className="-mt-3">
        <p className="text-center font-bold text-sm">
          レンジから相手のハンドを設定
        </p>
        <SetRangeHands
          total={9}
          setValue={setCompare}
          excludes={rangeExcludes}
        />
      </div>

      <div className="flex">
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
                    id={hand}
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

          <div className="fixed right-4 bottom-4 flex flex-col gap-y-2 opacity-80">
            <Button
              className="rounded-full"
              size="icon-lg"
              onClick={() => scrollToTop(true)}
            >
              <GalleryVerticalEnd className="rotate-180" />
            </Button>
            <Button
              className="rounded-full"
              size="icon-lg"
              onClick={() => scrollToMyHand(true)}
            >
              <GalleryVertical />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { ListX } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Combo } from "@/components/combo";
import { InputCardPalette } from "@/components/input-card-palette";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getShortHandName } from "@/lib/poker/pokersolver";
import { cn } from "@/lib/utils";
import {
  type simulateVsListWithRanks,
  simulateVsListWithRanksWithProgress,
} from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";

export default function Page() {
  const [target, setTarget] = useState<null | "hero" | "board" | "compare">(
    null,
  );
  const [hero, setHero] = useState("");
  const [board, setBoard] = useState("");
  const [compare, setCompare] = useState(""); // 想定する相手のハンド ;区切り
  const splitCards = (val: string) => {
    if (!val) return [] as string[];
    const replaced = val.replaceAll(";", " ");

    return replaced
      .split(" ")
      .map((c) => c.trim())
      .filter(Boolean);
  };

  const updateTarget = (cards: string) => {
    if (target === "hero") setHero(cards);
    if (target === "board") setBoard(cards);
    if (target === "compare") setCompare(cards);
  };

  const paletteValue =
    target === "hero"
      ? hero
      : target === "board"
        ? board
        : target === "compare"
          ? compare
          : "";
  const paletteLimit =
    target === "hero"
      ? 2
      : target === "board"
        ? 5
        : target === "compare"
          ? 30
          : undefined;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof simulateVsListWithRanks>
  > | null>(null);
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
      const result = await simulateVsListWithRanksWithProgress({
        hero: hero.split(" "),
        board: board.split(" "),
        compare: compare.split("; ").map((hand) => hand.split(" ")),
        trials: 1000,
        onProgress: (pct) => {
          setProgress(pct);
          console.log(`simulation progress: ${pct.toFixed(2)}%`);
        },
      });

      setResult(result);
      console.log("simulation result:", result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-8 overflow-scroll p-6">
      <h1 className="font-bold font-montserrat text-2xl">
        Monte Carlo Simulation
      </h1>
      <div className="w-full space-y-2">
        {loading ? (
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-3" />
            <span className="min-w-[72px] text-muted-foreground text-sm tabular-nums">
              {progress.toFixed(0)}%
            </span>
          </div>
        ) : null}
        <div className="space-y-3">
          <Label>hero</Label>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className={cn(
                "flex h-16 w-full flex-wrap items-center gap-1 rounded-md border px-4 py-2",
                target === "hero" &&
                  "bg-green-200 ring-2 ring-green-400 ring-offset-2 ring-offset-background dark:bg-green-900 dark:ring-green-600",
              )}
              onClick={() => setTarget("hero")}
            >
              {hero ? (
                hero
                  .split(" ")
                  .map((card) => (
                    <PlayCard key={card} rs={card} size="sm" className="w-8" />
                  ))
              ) : (
                <div className="text-sm">Select Hero Hand</div>
              )}
            </button>
            <Button size="icon-lg" variant="ghost" onClick={() => setHero("")}>
              <ListX size={32} />
            </Button>
          </div>
        </div>
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
          setHero("As Kh");
          setBoard("Kd Jc 5h");
          setCompare("Kc Ks; Qc Qh; Js Jh; 9c 9h; 8c 8h");
        }}
      >
        set test values
      </Button>
      <Button
        className="w-40"
        size="lg"
        onClick={() => {
          const allHands = getHandsByTiers(6, [
            ...hero.split(" "),
            ...board.split(" "),
          ]);
          const newCompare = allHands.join("; ").replaceAll(",", " ");
          setCompare(newCompare);
        }}
      >
        hand range of btn
      </Button>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-1">
          <div>{result.data.length} combos</div>
          {result.data.map(({ hand, win, tie, count, results }, index) => {
            const equity = ((win + tie / 2) / count) * 100;

            return (
              <div
                key={hand}
                className={cn(
                  "px-2 py-1",
                  result.hand === hand && "bg-orange-200 dark:bg-orange-900",
                )}
              >
                <div className="flex items-center gap-x-4">
                  <div>
                    {index + 1}.
                    <span className="text-xs">
                      ({(((index + 1) / result.data.length) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Combo hand={hand.split(" ")} />
                  <div className="text-lg/[1]">
                    {equity.toFixed(2)}%
                    <br />
                    <p className="text-sm">
                      (win: {win}, tie: {tie}, lose: {count - win - tie})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Object.keys(results).map((name) => {
                    const probability = (
                      (results[name as keyof typeof results] / count) *
                      100
                    ).toFixed(1);
                    const colorClass =
                      Number(probability) >= 80
                        ? "bg-green-600 dark:bg-green-950"
                        : Number(probability) >= 60
                          ? "bg-green-500 dark:bg-green-900"
                          : Number(probability) >= 40
                            ? "bg-green-400 dark:bg-green-800"
                            : "bg-green-200 dark:bg-green-700";

                    return (
                      <div
                        key={name}
                        className="relative z-10 flex h-fit w-18 justify-between gap-x-2 overflow-hidden rounded-xs border bg-background px-1 py-px text-xs"
                      >
                        <div>{getShortHandName(name)}</div>
                        <div>{probability}%</div>
                        <div
                          className={`${colorClass} absolute top-0 left-0 -z-10 h-full`}
                          style={{ width: `${probability}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {target && (
        <div className="fixed bottom-0 left-0 flex w-full justify-center gap-x-1 bg-background p-2">
          <InputCardPalette
            key={target}
            value={paletteValue}
            limit={paletteLimit}
            handSeparator={target === "compare" ? "; " : null}
            banCards={[
              ...splitCards(hero),
              ...splitCards(board),
              ...splitCards(compare),
            ]}
            onChange={(val) => updateTarget(val)}
          />
        </div>
      )}
    </div>
  );
}

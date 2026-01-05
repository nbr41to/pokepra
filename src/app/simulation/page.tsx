"use client";

import { ListX } from "lucide-react";
import { Fragment, useState } from "react";
import { InputCardPalette } from "@/components/input-card-palette";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";

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

  const runSimulation = async () => {
    setTarget(null);
    setError(null);
    setLoading(true);

    try {
      const result = await simulateVsListWithRanks({
        hero,
        board,
        compare,
        trials: 1000,
      });

      setResult(result);

      console.log("simulation result:", result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-8 overflow-scroll p-6">
      <h1 className="font-bold font-montserrat text-2xl">
        Monte Carlo Simulation
      </h1>
      <div className="w-full space-y-2">
        <div className="space-y-3">
          <Label>hero</Label>
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className={cn(
                "flex h-16 w-full flex-wrap items-center gap-1 rounded-md border px-4 py-2",
                target === "hero" &&
                  "bg-green-200 ring-2 ring-green-400 ring-offset-2",
              )}
              onClick={() => setTarget("hero")}
            >
              {hero ? (
                hero
                  .split(" ")
                  .map((card) => (
                    <PlayCard
                      key={card}
                      rank={card[0]}
                      suit={card[1] as "c" | "d" | "h" | "s"}
                      size="sm"
                      className="w-8"
                    />
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
                  "bg-green-200 ring-2 ring-green-400 ring-offset-2",
              )}
              onClick={() => {
                setTarget("board");
              }}
            >
              {board ? (
                board
                  .split(" ")
                  .map((card) => (
                    <PlayCard
                      key={card}
                      rank={card[0]}
                      suit={card[1] as "c" | "d" | "h" | "s"}
                      size="sm"
                      className="w-8"
                    />
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
          <div className="flex items-center gap-x-1">
            <button
              type="button"
              className={cn(
                "flex h-16 w-full flex-wrap items-center gap-1 rounded-md border px-4 py-2",
                target === "compare" &&
                  "bg-green-200 ring-2 ring-green-400 ring-offset-2",
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
                        rank={card[0]}
                        suit={card[1] as "c" | "d" | "h" | "s"}
                        size="sm"
                        className="w-8"
                      />
                    ))}
                    <span
                      className={cn(
                        "grid h-full place-content-end",
                        hand.length === i + 1 && "hidden",
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

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {error}
        </div>
      )}

      {result && (
        <ScrollArea className="grow">
          <div>{(result.equity * 100).toFixed(2)}%</div>
          {result.data.map(({ hand, win, tie, count, results }) => {
            const equity = ((win + tie / 2) / count) * 100;

            return (
              <div key={hand} className="mt-4">
                <div>
                  {equity.toFixed(2)}% ({win} Wins, {tie} Ties, {count} Plays)
                </div>

                <div className="mb-2 font-bold">Hand: {hand}</div>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(results).map((handName) => {
                    const probability = (
                      (results[handName as keyof typeof results] / count) *
                      100
                    ).toFixed(2);

                    return (
                      <div
                        key={handName}
                        className="rounded-md border border-border/60 bg-background/60 p-3 shadow-sm"
                      >
                        {handName}: {probability}%
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </ScrollArea>
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

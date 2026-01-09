"use client";

import { ListX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputCardPalette } from "@/components/input-card-palette";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RANK_ORDER, RANKS } from "@/constants/card";
import { cn } from "@/lib/utils";
import { simulateVsListEquityWithProgress } from "@/lib/wasm/simulation";
import { getHandsByTiers, getShuffledDeck } from "@/utils/dealer";
import { getHandString } from "@/utils/preflop-range";

export function Main() {
  const [target, setTarget] = useState<null | "board">(null);
  const [board, setBoard] = useState("");

  const splitCards = (val: string) => {
    if (!val) return [] as string[];
    const replaced = val.replaceAll(";", " ");

    return replaced
      .split(" ")
      .map((c) => c.trim())
      .filter(Boolean);
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | {
        hand: string;
        equity: number;
      }[]
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const progressByHandRef = useRef<number[]>([]);
  const progressRafRef = useRef<number | null>(null);

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

    const btnRangeHands = getHandsByTiers(7, splitCards(board));
    const utgRangeHands = getHandsByTiers(1, splitCards(board));

    try {
      progressByHandRef.current = new Array(btnRangeHands.length).fill(0);
      const updateProgress = (index: number, pct: number) => {
        progressByHandRef.current[index] = pct;
        if (progressRafRef.current !== null) {
          return;
        }
        progressRafRef.current = requestAnimationFrame(() => {
          progressRafRef.current = null;
          const total = progressByHandRef.current.reduce(
            (sum, value) => sum + value,
            0,
          );
          setProgress(
            progressByHandRef.current.length === 0
              ? 0
              : total / progressByHandRef.current.length,
          );
        });
      };

      const equities = await Promise.all(
        btnRangeHands.map(async (btnHand, index) => {
          const filteredUtgHands = utgRangeHands.filter(
            (hand) => !hand.some((card) => btnHand.includes(card)),
          );

          const result = await simulateVsListEquityWithProgress({
            hero: btnHand,
            board: splitCards(board),
            compare: filteredUtgHands,
            trials: 1000,
            onProgress: (pct) => {
              updateProgress(index, pct);
            },
          });
          return {
            hand: btnHand.join(" "),
            equity: result.equity,
          };
        }),
      );

      setResult(equities);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
      if (progressRafRef.current !== null) {
        cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
    }
  };

  return (
    <div className="w-full max-w-full space-y-3">
      <div className="space-y-2 pb-6">
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
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          onClick={() => {
            const deck = getShuffledDeck();
            setBoard(deck.slice(0, 3).join(" "));
          }}
        >
          set random board
        </Button>
        <Button
          size="lg"
          onClick={() => {
            // ペアボードとなる3枚とランダムに生成
            const deck = getShuffledDeck();
            const pairRank = RANKS[Math.floor(Math.random() * 13)];
            const pairCards = deck.filter((card) => card.startsWith(pairRank));
            const otherCards = deck.filter((card) => !pairCards.includes(card));
            const boardCards = [pairCards[0], pairCards[1], otherCards[0]];
            setBoard(boardCards.join(" "));
          }}
        >
          set pair board
        </Button>
        <Button
          size="lg"
          onClick={() => {
            const deck = getShuffledDeck();
            // 2〜7の数字をランダムに並べる
            const ramLowRanks = RANKS.slice(7, 13)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            const lowCards = ramLowRanks.map(
              (rank) => deck.filter((card) => card.startsWith(rank))[0],
            );

            setBoard(lowCards.slice(0, 3).join(" "));
          }}
        >
          set low board
        </Button>
      </div>
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

      {/* Summary */}
      {result && (
        <div>
          BTN vs UTG Range EQ:{" "}
          {(
            result.reduce((sum, r) => sum + r.equity, 0) / result.length
          ).toFixed(2)}
          %
        </div>
      )}

      {/* Results */}
      {result && (
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
              const totalEquities = result.filter(
                (res) => getHandString(res.hand.split(" ")) === ranksString,
              );
              const totalEquity =
                totalEquities.reduce((sum, r) => sum + r.equity, 0) /
                (totalEquities.length || 1);

              return (
                <div
                  key={rank}
                  className={cn(
                    "relative grid h-6 w-8 place-items-center border-t border-l text-[11px] text-foreground",
                  )}
                >
                  <span className="relative z-10">{ranksString}</span>
                  <div
                    className="absolute bottom-0 left-0 h-full bg-red-500 opacity-80"
                    style={{
                      width: `${totalEquity * 100}%`,
                    }}
                  />
                </div>
              );
            });
          })}
        </div>
      )}

      {target && (
        <div className="fixed bottom-0 left-0 z-10 flex w-full justify-center gap-x-1 bg-background p-2">
          <InputCardPalette
            key={target}
            value={board}
            limit={5}
            banCards={splitCards(board)}
            onChange={(val) => setBoard(val)}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { InputCards } from "@/components/input-cards";
import { SelectPosition } from "@/components/select-position";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { simulateVsListEquityWithProgress } from "@/lib/wasm/simulation";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";
import { getShuffledDeck } from "@/utils/dealer";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { getPositionLabel } from "@/utils/position";

export function Main() {
  const [board, setBoard] = useState("");
  const [comparePositions, setComparePositions] = useState<number[]>([]); // 想定する相手のポジション

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

  const runSimulation = async () => {
    if (comparePositions.length !== 2) {
      setError("Please select exactly two positions to compare.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(0);

    const btnRangeHands = getHandsInRange(
      getRangeStrengthByPosition(comparePositions[0]),
      splitCards(board),
    );
    const utgRangeHands = getHandsInRange(
      getRangeStrengthByPosition(comparePositions[1]),
      splitCards(board),
    );

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
    <div className="w-full space-y-3">
      <div className="space-y-3">
        <Label>board (0 ~ 5)</Label>
        <InputCards
          value={board}
          onChange={setBoard}
          limit={5}
          banCards={splitCards(board)}
        />

        <Label>compare1</Label>
        <SelectPosition
          total={9}
          value={comparePositions[0]}
          setValue={(value) =>
            setComparePositions([value, comparePositions[1]])
          }
        />

        <Label>compare2</Label>
        <SelectPosition
          total={9}
          value={comparePositions[1]}
          setValue={(value) =>
            setComparePositions([comparePositions[0], value])
          }
        />
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
            const pairRank = CARD_RANKS[Math.floor(Math.random() * 13)];
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
            const ramLowRanks = CARD_RANKS.slice(7, 13)
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
          {getPositionLabel(comparePositions[0], 9)} vs{" "}
          {getPositionLabel(comparePositions[1], 9)} | EQ Ave:{" "}
          {(
            result.reduce((sum, r) => sum + r.equity * 100, 0) / result.length
          ).toFixed(2)}
          % |{" "}
          {(
            (result.filter((r) => r.equity > 0.5).length / result.length) *
            100
          ).toFixed(2)}
          %
        </div>
      )}

      {/* Results */}
      {result && (
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
              const totalEquities = result.filter(
                (res) => toHandSymbol(res.hand.split(" ")) === ranksString,
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
    </div>
  );
}

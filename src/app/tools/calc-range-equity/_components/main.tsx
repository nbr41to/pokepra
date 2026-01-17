"use client";

import { useState } from "react";
import { InputBoard } from "@/components/input-board";
import { SelectPosition } from "@/components/select-position";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { simulateRangeVsRangeEquityWithProgress } from "@/lib/wasm/simulation";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";
import { getRangeStrengthByPosition, toHandSymbol } from "@/utils/hand-range";
import { getPositionLabel } from "@/utils/position";

const HAND_RANGE_SYMBOLS = [
  "QQ+,AKo,AKs",
  "99+,ATs+,AQo+,KQs",
  "77+,ATs+,AJo+,KJs+,QJ-JTs,KQo",
  "55+,A2s+,K9s+,ATo+,QTs+,KJo+,JT-T9s",
  "22+,A2s+,A9o+,K9s+,Q9s+,KTo+,J9s+,T8s+,QJ-JTo,98s",
  "22+,A2s+,K2s+,A7o+,Q6s+,J7s+,K9o+,Q9o+,T8s+,97s+,J9o+,87-65s,T9o",
  "22+,A2s+,K2s+,Q2s+,A6o+,J6s+,K9o+,Q9o+,T7s+,96s+,J9o+,86s+,75s+,64s+,T9-98o,54s",
  "22+,A2s+,A2o+,K2s+,Q2s+,J2s+,K5o+,T3s+,Q7o+,95s+,85s+,74s+,63s+,J8o+,53s+,T8o+,97o+,87o,43s",
];

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
        compareWeight: number;
      }[]
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runSimulation = async () => {
    if (comparePositions.length !== 2) {
      setError("Please select exactly two positions to compare.");
      return;
    }
    setError(null);
    setLoading(true);
    setProgress(0);

    const heroRangeStrings =
      HAND_RANGE_SYMBOLS[getRangeStrengthByPosition(comparePositions[0], 9)];
    const villainRangeStrings =
      HAND_RANGE_SYMBOLS[getRangeStrengthByPosition(comparePositions[1], 9)];

    try {
      const result = await simulateRangeVsRangeEquityWithProgress({
        board: splitCards(board),
        heroRange: heroRangeStrings,
        villainRange: villainRangeStrings,
        trials: 100,
        onProgress: (pct) => setProgress(pct),
      });

      setResult(
        result.hero.map((entry) => ({
          hand: entry.hand,
          equity: entry.equity,
          compareWeight: 1,
        })),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="space-y-3">
        <Label className="font-bold">ボード（0 ~ 5枚）</Label>
        <InputBoard
          value={board}
          onChange={setBoard}
          limit={5}
          banCards={splitCards(board)}
        />
        <div>
          <Label className="font-bold">あなたのハンドレンジ</Label>
          <SelectPosition
            total={9}
            value={comparePositions[0]}
            setValue={(value) =>
              setComparePositions([value, comparePositions[1]])
            }
          />
        </div>
        <div>
          <Label className="font-bold">相手のハンドレンジ</Label>
          <SelectPosition
            total={9}
            value={comparePositions[1]}
            setValue={(value) =>
              setComparePositions([comparePositions[0], value])
            }
          />
        </div>
      </div>

      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={runSimulation}
        disabled={
          loading ||
          splitCards(board).length < 3 ||
          comparePositions.length !== 2
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

      {/* Summary */}
      {result && (
        <div className="flex flex-col items-center">
          <div>
            {getPositionLabel(comparePositions[0], 9)} vs{" "}
            {getPositionLabel(comparePositions[1], 9)}
          </div>
          <div>
            Range EQ :{" "}
            {(
              result.reduce(
                (sum, r) => sum + r.equity * r.compareWeight * 100,
                0,
              ) / result.length
            ).toFixed(2)}
            %
          </div>
          <div>
            勝率が50%を上回っている割合:{" "}
            {(
              (result.reduce(
                (sum, r) => sum + (r.equity > 0.5 ? r.compareWeight : 0),
                0,
              ) /
                result.reduce((sum, r) => sum + r.compareWeight, 0)) *
              100
            ).toFixed(2)}
            %
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mx-auto grid w-fit grid-cols-13 border-r border-b">
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
                totalEquities.reduce(
                  (sum, r) => sum + r.equity * r.compareWeight,
                  0,
                ) /
                (totalEquities.reduce((sum, r) => sum + r.compareWeight, 0) ||
                  1);

              return (
                <div
                  key={rank}
                  className={cn(
                    "relative grid h-5 w-7 place-items-center border-t border-l text-[10px] text-foreground",
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

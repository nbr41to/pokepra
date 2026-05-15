"use client";

import { useEffect } from "react";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useSixMaxStore } from "./_utils/state";
import { BIG_BLIND } from "./_utils/types";
import { ActionButtons } from "./action-buttons";
import { BoardDisplay } from "./board-display";
import { EvaluationPanel } from "./evaluation-panel";
import { FormulaTips } from "./formula-tips";
import { HandDisplay } from "./hand-display";
import { PotInfo } from "./pot-info";
import { ScoreBar } from "./score-bar";
import { SixMaxTable } from "./six-max-table";

const STREET_LABEL: Record<string, string> = {
  preflop: "プリフロップ",
  flop: "フロップ",
  turn: "ターン",
  river: "リバー",
  showdown: "ショーダウン",
};

/**
 * Six Max Evaluator のメインコンテナ
 *
 * - 上段: スコアバー
 * - 6maxテーブル (Hero位置と Opener を視覚化)
 * - ボード / 手札
 * - ポット情報 + スタックビュー
 * - アクションボタン
 * - 評価パネル (日本語フィードバック)
 */
export default function Main() {
  const {
    gameId,
    finished,
    evaluating,
    street,
    hero,
    board,
    position,
    pot,
    toCall,
    heroStack,
    villainStack,
    preflopState,
    lastEvaluation,
    totalEvLoss,
    roundsPlayed,
    startNewRound,
    submitAction,
    clearAll,
  } = useSixMaxStore();

  useEffect(() => {
    startNewRound();
    return clearAll;
  }, [startNewRound, clearAll]);

  if (!gameId) return null;

  const potLabel = `${(pot / BIG_BLIND).toFixed(1)}BB`;
  const evDelta = lastEvaluation ? -lastEvaluation.evLoss : 0;

  return (
    <div className="mx-auto w-full max-w-md space-y-3 px-2 pb-24">
      <ScoreBar totalEvLoss={totalEvLoss} roundsPlayed={roundsPlayed} />

      <div className="flex items-center justify-between">
        <div className="rounded-full bg-muted px-3 py-1 font-bold text-xs">
          {STREET_LABEL[street] ?? street}
        </div>
        <FormulaTips />
      </div>

      <SixMaxTable
        heroPosition={position}
        openerPosition={preflopState.opener}
        potLabel={potLabel}
      />

      <BoardDisplay board={board} />

      <div className="flex items-end justify-center gap-3">
        <HandDisplay hero={hero} />
        <div className="flex flex-col items-center gap-1">
          <StackView stack={Math.round(heroStack / BIG_BLIND)} />
          {lastEvaluation && (
            <div
              className={cn(
                "min-w-15 text-center font-bold text-xs tabular-nums",
                evDelta >= 0 ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {evDelta === 0
                ? "±0 BB"
                : `${(evDelta / BIG_BLIND).toFixed(2)} BB`}
            </div>
          )}
        </div>
      </div>

      <PotInfo
        pot={pot}
        toCall={toCall}
        heroStack={heroStack}
        villainStack={villainStack}
      />

      <div className="relative">
        <ActionButtons
          pot={pot}
          toCall={toCall}
          heroStack={heroStack}
          villainStack={villainStack}
          disabled={finished || evaluating}
          onPick={submitAction}
        />
        {evaluating && (
          <div className="absolute inset-0 grid place-content-center bg-background/60">
            <Spinner className="size-10 text-blue-500" />
          </div>
        )}
        {finished && (
          <div className="absolute inset-0 grid place-content-center bg-background/70">
            <Button size="lg" onClick={startNewRound} className="shadow">
              次のハンドへ
            </Button>
          </div>
        )}
      </div>

      <EvaluationPanel evaluation={lastEvaluation} />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import {
  actionLabelJp,
  buildExplanation,
  gradeJpComment,
  gradeJpLabel,
} from "./_utils/jp-text";
import { type ActionEvaluation, BIG_BLIND } from "./_utils/types";

type Props = {
  evaluation: ActionEvaluation | null;
  className?: string;
};

const fmtBB = (chips: number) => `${(chips / BIG_BLIND).toFixed(2)}BB`;
const fmtPct = (p: number) => `${(p * 100).toFixed(1)}%`;

const GRADE_COLORS: Record<ActionEvaluation["grade"], string> = {
  great:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  good: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  ok: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  bad: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  terrible: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
};

/**
 * アクション評価パネル (日本語版)
 * - グレード + 一言講評
 * - 「選んだ」「最善」アクション比較
 * - 主要統計（勝率 / Pot Odds / MDF）
 * - 解説文（なぜそうなるか）
 * - 詳細：全候補のEV/fold%/E_called
 */
export const EvaluationPanel = ({ evaluation, className }: Props) => {
  if (!evaluation) return null;
  const {
    choice,
    heroEquity,
    villainRangeSize,
    numOpponents,
    pot,
    toCall,
    potOdds,
    mdf,
    evChips,
    bestChoice,
    bestEvChips,
    evLoss,
    grade,
    allCandidates,
  } = evaluation;

  const explanations = buildExplanation(evaluation);

  return (
    <div
      className={cn(
        "space-y-3 rounded-md border bg-card p-3 text-xs shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="font-bold text-sm">アクション評価</div>
        <div
          className={cn(
            "rounded px-2 py-0.5 font-bold text-xs",
            GRADE_COLORS[grade],
          )}
        >
          {gradeJpLabel(grade)}
        </div>
      </div>

      <div className="text-muted-foreground text-xs">
        {gradeJpComment(grade)}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div className="flex justify-between">
          <span className="text-muted-foreground">あなたの選択</span>
          <span className="font-medium">{actionLabelJp(choice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">最善手</span>
          <span className="font-medium">{actionLabelJp(bestChoice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            勝率{numOpponents > 1 ? `(${numOpponents}人相手)` : ""}
          </span>
          <span className="font-medium">{fmtPct(heroEquity)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">相手レンジ</span>
          <span className="font-medium">{villainRangeSize}通り</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">残り相手</span>
          <span className="font-medium">{numOpponents}人</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ポット</span>
          <span className="font-medium">{fmtBB(pot)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">必要コール額</span>
          <span className="font-medium">
            {toCall > 0 ? fmtBB(toCall) : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ポットオッズ</span>
          <span className="font-medium">
            {toCall > 0 ? fmtPct(potOdds) : "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">MDF</span>
          <span className="font-medium">{toCall > 0 ? fmtPct(mdf) : "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">あなたのEV</span>
          <span className="font-medium">{fmtBB(evChips)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">最善EV</span>
          <span className="font-medium">{fmtBB(bestEvChips)}</span>
        </div>
        <div className="col-span-2 flex justify-between">
          <span className="text-muted-foreground">EVロス</span>
          <span
            className={cn(
              "font-bold",
              evLoss < BIG_BLIND * 0.5 ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {evLoss > 0 ? `-${fmtBB(evLoss)}` : "0BB"}
          </span>
        </div>
      </div>

      <div className="space-y-1 rounded-md bg-muted/40 p-2 text-xs leading-relaxed">
        {explanations.map((line) => (
          <p key={line}>・{line}</p>
        ))}
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          全候補のEV（フォールド率 / コールされた時の勝率 を併記）
        </summary>
        <div className="mt-2 space-y-1">
          {allCandidates
            .slice()
            .sort((a, b) => b.evChips - a.evChips)
            .map((c) => (
              <div
                key={`${c.choice.kind}-${c.choice.amount}`}
                className={cn(
                  "rounded px-2 py-1",
                  c.choice.kind === bestChoice.kind &&
                    c.choice.amount === bestChoice.amount
                    ? "bg-emerald-50 dark:bg-emerald-950/40"
                    : "",
                  c.choice.kind === choice.kind &&
                    c.choice.amount === choice.amount
                    ? "ring-1 ring-blue-400"
                    : "",
                )}
              >
                <div className="flex justify-between">
                  <span>{actionLabelJp(c.choice)}</span>
                  <span className="font-mono">{fmtBB(c.evChips)}</span>
                </div>
                {c.meta && (
                  <div className="flex justify-end gap-2 text-[10px] text-muted-foreground">
                    <span>相手fold {fmtPct(c.meta.foldFraction ?? 0)}</span>
                    <span>
                      コール時勝率 {fmtPct(c.meta.heroEquityVsCalled ?? 0)}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </details>
    </div>
  );
};

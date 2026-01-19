"use client";

import { useMemo, useState } from "react";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { simulateVsListWithRanksTrace } from "@/lib/wasm/simulation";
import type { MonteCarloTraceEntry } from "@/lib/wasm/types";
import { getAllCombos } from "@/utils/dealer";
import { shuffleArray } from "@/utils/general";

const HERO_HAND = ["Ah", "Kh"];
const FLOP_BOARD = ["Qs", "Jh", "2c"];
const TRIALS = 100;

const splitCards = (cards: string) =>
  cards
    .split(" ")
    .map((card) => card.trim())
    .filter(Boolean);

const outcomeLabel = (outcome: MonteCarloTraceEntry["outcome"]) => {
  if (outcome === "hero") return "You Win";
  if (outcome === "villain") return "You Lose";
  return "Tie";
};

const randomCardClass =
  "rounded-md bg-amber-100/70 p-1.5 shadow-sm ring-1 ring-amber-200/70 dark:bg-amber-500/15 dark:ring-amber-400/30";
const cardPairClass = "flex items-center gap-2";

export const Main = () => {
  const [loading, setLoading] = useState(false);
  const [trace, setTrace] = useState<MonteCarloTraceEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allCombos = useMemo(
    () => getAllCombos([...HERO_HAND, ...FLOP_BOARD]),
    [],
  );

  const resultSummary = useMemo(() => {
    if (!trace) return null;
    const total = trace.length;
    const wins = trace.filter((entry) => entry.outcome === "hero").length;
    const ties = trace.filter((entry) => entry.outcome === "tie").length;
    const losses = total - wins - ties;
    const equity = total === 0 ? 0 : ((wins + ties / 2) / total) * 100;
    const rankCounts = trace.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.rankName] = (acc[entry.rankName] ?? 0) + 1;
      return acc;
    }, {});
    const sortedRanks = Object.entries(rankCounts).sort((a, b) => b[1] - a[1]);
    return { total, wins, ties, losses, equity, sortedRanks };
  }, [trace]);

  const runSimulation = async () => {
    setError(null);
    setLoading(true);
    setTrace(null);

    try {
      const sampledOpponents = shuffleArray(allCombos).slice(0, TRIALS);
      const data = await simulateVsListWithRanksTrace({
        hero: HERO_HAND,
        board: FLOP_BOARD,
        compare: sampledOpponents,
        trials: 1,
      });
      setTrace(data);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-6 rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <p className="text-slate-700 text-sm dark:text-slate-200">
          今回は実際のポーカープレイ中のとある状況に固定して、そこから先（ターン・リバー）をシミュレーションするモンテカルロ法を体験します。
          対戦相手は全ハンドからランダムに選ばれるものとして、100回の試行を繰り返して見ましょう。
        </p>
        <div className="space-y-3 rounded-xl bg-slate-900/5 p-4 dark:bg-white/10">
          <div className="text-slate-500 text-xs uppercase tracking-[0.3em] dark:text-slate-300">
            Situation
          </div>
          <div className="grid gap-4 text-slate-700 text-sm sm:grid-cols-2 dark:text-slate-200">
            <div>
              <p className="font-semibold">あなたのハンド</p>
              <div className="mt-2 flex items-center gap-2">
                {HERO_HAND.map((card) => (
                  <PlayCard key={card} rs={card} size="sm" />
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold">フロップ</p>
              <div className="mt-2 flex items-center gap-2">
                {FLOP_BOARD.map((card) => (
                  <PlayCard key={card} rs={card} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Button
          className="w-full rounded-full font-bold"
          size="lg"
          onClick={runSimulation}
          disabled={loading}
        >
          {loading ? "Simulating..." : "100回シミュレーションする"}
        </Button>
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}
      </section>

      {trace && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg">シミュレーション結果</h3>
            <p className="text-slate-600 text-sm dark:text-slate-300">
              実際に引かれたターン・リバーと完成した役を確認した後、勝率をまとめています。
            </p>
          </div>
          <ScrollArea className="h-92 rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/70">
            <div className="space-y-3">
              {trace.map((entry, index) => {
                const boardCards = splitCards(entry.board);
                const heroCards = splitCards(entry.hero);
                const villainCards = splitCards(entry.villain);

                return (
                  <div
                    key={`${entry.board}-${entry.villain}-${index}`}
                    className="rounded-xl border border-black/5 bg-white/70 p-3 text-slate-700 text-xs shadow-sm dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-slate-500 text-xs">
                        #{index + 1}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-semibold",
                          entry.outcome === "hero" &&
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
                          entry.outcome === "villain" &&
                            "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
                          entry.outcome === "tie" &&
                            "bg-slate-200 text-slate-700 dark:bg-slate-500/40 dark:text-slate-100",
                        )}
                      >
                        {outcomeLabel(entry.outcome)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-300">
                        完成した役: {entry.rankName}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                          {boardCards.slice(0, 3).map((card) => (
                            <PlayCard key={card} rs={card} size="sm" />
                          ))}
                          <div className={cn(cardPairClass, randomCardClass)}>
                            {boardCards.slice(3, 5).map((card) => (
                              <PlayCard key={card} rs={card} size="sm" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-24 font-semibold text-[0.7rem] text-slate-500 uppercase tracking-[0.2em]">
                          あなたのハンド
                        </span>
                        <div className={cardPairClass}>
                          {heroCards.map((card) => (
                            <PlayCard key={card} rs={card} size="sm" />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-24 font-semibold text-[0.7rem] text-slate-500 uppercase tracking-[0.2em]">
                          相手のハンド
                        </span>
                        <div className={cn(cardPairClass, randomCardClass)}>
                          {villainCards.map((card) => (
                            <PlayCard key={card} rs={card} size="sm" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          {resultSummary && (
            <div className="rounded-2xl border border-black/10 bg-white/80 p-5 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <div className="text-slate-500 text-xs uppercase tracking-[0.3em] dark:text-slate-300">
                Equity Summary
              </div>
              <div className="mt-3 grid gap-2 text-slate-700 sm:grid-cols-2 dark:text-slate-200">
                <div className="font-semibold text-2xl">
                  勝率 {resultSummary.equity.toFixed(1)}%
                </div>
                <div className="space-y-1 text-slate-600 text-sm dark:text-slate-300">
                  <div>試行回数: {resultSummary.total}</div>
                  <div>勝ち: {resultSummary.wins}</div>
                  <div>引き分け: {resultSummary.ties}</div>
                  <div>負け: {resultSummary.losses}</div>
                </div>
              </div>
              <div className="mt-4 border-black/10 border-t pt-3 dark:border-white/10">
                <div className="text-slate-500 text-xs uppercase tracking-[0.3em] dark:text-slate-300">
                  役の回数
                </div>
                <div className="mt-2 grid gap-2 text-slate-600 text-xs sm:grid-cols-2 dark:text-slate-300">
                  {resultSummary.sortedRanks.map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between rounded-lg bg-slate-900/5 px-3 py-2 dark:bg-white/10"
                    >
                      <span>{name}</span>
                      <span className="tabular-nums">{count}回</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              状況的には10が落ちてストレートが完成すればという局面ですが、今回求めた勝率は「ストレートを引く確率」だけでなく、相手の手やその後のターン・リバーの様々なパターンを含めた総合的な結果です。
              同じフロップでも、相手のレンジやボードの質感によって勝率は大きく変わります。今回の試行回数100回と少なかったので、正確さに欠けましたが、特定の状況における勝率を求めることができました！
            </p>
            <p className="text-muted-foreground text-sm">
              実際のポーカーではベッティングラウンドがあるため考えることが増えますが、この状況における勝率であることに変わりはありません。
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

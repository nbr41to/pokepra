"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Progress } from "@/components/shadcn/progress";
import preflopHandRanking from "@/data/preflop-hand-ranking.json";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";
import { simulateVsListEquity } from "@/lib/wasm/simulation";
import { getAllCombos } from "@/utils/dealer";
import { EquitiesTable } from "./equities-table";

const TRIALS = 100;
const SUITS = ["s", "h", "d", "c"] as const;

const toHeroCards = (hand: string) => {
  if (hand.length === 2) {
    const rank = hand[0];
    return [`${rank}${SUITS[0]}`, `${rank}${SUITS[1]}`];
  }

  const rankA = hand[0];
  const rankB = hand[1];
  const suited = hand[2] === "s";
  if (suited) {
    return [`${rankA}${SUITS[0]}`, `${rankB}${SUITS[0]}`];
  }
  return [`${rankA}${SUITS[0]}`, `${rankB}${SUITS[1]}`];
};

const formatPct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export const Main = () => {
  const allHands = preflopHandRanking;
  const allCombos = useMemo(() => getAllCombos(), []);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulated, setSimulated] = useState<Record<string, number> | null>(
    null,
  );

  const summary = useMemo(() => {
    if (!simulated) return null;
    const diffs = allHands.map((row) =>
      Math.abs(simulated[row.hand] - row.player2),
    );
    const avg = diffs.reduce((sum, val) => sum + val, 0) / diffs.length;
    const max = Math.max(...diffs);
    return { avg, max };
  }, [allHands, simulated]);

  const runSimulation = async () => {
    setError(null);
    setRunning(true);
    setProgress(0);

    try {
      const nextResult: Record<string, number> = {};
      const totalHands = allHands.length;

      for (let i = 0; i < totalHands; i += 1) {
        const entry = allHands[i];
        const hero = toHeroCards(entry.hand);
        const compare = allCombos.filter(
          (combo) => !combo.includes(hero[0]) && !combo.includes(hero[1]),
        );

        const result = await simulateVsListEquity({
          hero,
          board: [],
          compare,
          trials: TRIALS,
          onProgress: (pct) => {
            const overall = ((i + pct / 100) / totalHands) * 100;
            setProgress(overall);
          },
        });

        nextResult[entry.hand] = result.equity * 100;
        setProgress(((i + 1) / totalHands) * 100);
      }

      setSimulated(nextResult);
    } catch (simulationError) {
      setError((simulationError as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="space-y-4">
      <TipsText>
        プリフロップの（自分のハンドが2枚配られた）時点での勝率の一覧です。
        参加人数が、2 人 、6人、10 人のときの勝率をそれぞれ確認できます。
      </TipsText>

      <TipsCard className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">モンテカルロで比較する</h2>
            <p className="text-muted-foreground text-xs">
              実際にすべてのハンドに対してヘッズアップを100
              回シミュレーションして、勝率を求めてみます。
            </p>
          </div>
          <Button size="sm" onClick={runSimulation} disabled={running}>
            {running ? "計算中..." : "モンテカルロ実行"}
          </Button>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="tabular-nums">{progress.toFixed(0)}%</span>
        </div>
        {summary && (
          <div className="grid gap-3 text-muted-foreground text-xs md:grid-cols-2">
            <div className="rounded-md bg-muted/60 p-3">
              平均誤差:{" "}
              <span className="font-semibold">{formatPct(summary.avg)}</span>
            </div>
            <div className="rounded-md bg-muted/60 p-3">
              最大誤差:{" "}
              <span className="font-semibold">{formatPct(summary.max)}</span>
            </div>
          </div>
        )}
        {error ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs">
            {error}
          </div>
        ) : null}
      </TipsCard>
      <TipsCard className="space-y-3">
        <h2 className="font-semibold">勝率テーブル (全ハンド)</h2>
        <div className="max-h-100 overflow-y-auto bg-muted px-2">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="py-2 pr-3">位</th>
                <th className="whitespace-nowrap py-2 pr-3">ハンド</th>
                <th className="py-2 pr-3">2人</th>
                <th className="py-2 pr-3">実行結果</th>
                <th className="py-2 pr-3">差</th>
                <th className="py-2 pr-3">6人</th>
                <th className="py-2 pr-3">10人</th>
              </tr>
            </thead>
            <tbody>
              {allHands.map((row) => {
                const sim = simulated?.[row.hand];
                const diff = typeof sim === "number" ? sim - row.player2 : null;
                return (
                  <tr key={row.hand} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs">{row.rank}</td>
                    <td className="py-2 pr-3 font-semibold">{row.hand}</td>
                    <td className="py-2 pr-3">{formatPct(row.player2)}</td>
                    <td className="py-2 pr-3">
                      {typeof sim === "number" ? formatPct(sim) : "-"}
                    </td>
                    <td className="py-2 pr-3">
                      {typeof diff === "number"
                        ? formatPct(Math.abs(diff))
                        : "-"}
                    </td>
                    <td className="py-2 pr-3">{row.player6}%</td>
                    <td className="py-2 pr-3">{row.player10}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-xs">
          s=スーテッド, o=オフスート。
        </p>
        <p className="text-muted-foreground text-xs">
          引用元: https://mpj-portal.jp/forbeginners/technique-pokertable/
        </p>
      </TipsCard>
      <TipsCard className="space-y-3">
        <h2 className="font-semibold">レンジ表で確認する（2 人）</h2>
        <EquitiesTable equities={allHands} />
      </TipsCard>
    </section>
  );
};

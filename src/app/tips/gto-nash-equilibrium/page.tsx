"use client";

import { useMemo, useState } from "react";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";

const HANDS = ["グー", "チョキ", "パー"] as const;
const ROUNDS = 1000;

type SimulationResult = {
  playerA: number[];
  playerB: number[];
  outcomes: {
    aWin: number;
    draw: number;
    bWin: number;
  };
};

const getOutcome = (a: number, b: number) => {
  if (a === b) return 0;
  if ((a === 0 && b === 1) || (a === 1 && b === 2) || (a === 2 && b === 0)) {
    return 1;
  }
  return -1;
};

const simulateRps = (rounds: number): SimulationResult => {
  const playerA = Array.from({ length: 3 }, () => 0);
  const playerB = Array.from({ length: 3 }, () => 0);
  const outcomes = { aWin: 0, draw: 0, bWin: 0 };

  for (let i = 0; i < rounds; i += 1) {
    const a = Math.floor(Math.random() * 3);
    const b = Math.floor(Math.random() * 3);
    playerA[a] += 1;
    playerB[b] += 1;
    const outcome = getOutcome(a, b);
    if (outcome === 0) outcomes.draw += 1;
    if (outcome === 1) outcomes.aWin += 1;
    if (outcome === -1) outcomes.bWin += 1;
  }

  return { playerA, playerB, outcomes };
};

export default function GtoNashEquilibriumPage() {
  const [result, setResult] = useState<SimulationResult>(() =>
    simulateRps(ROUNDS),
  );

  const expected = ROUNDS / 3;
  const maxDeviationA = useMemo(
    () =>
      Math.max(...result.playerA.map((count) => Math.abs(count - expected))),
    [result.playerA, expected],
  );
  const maxDeviationB = useMemo(
    () =>
      Math.max(...result.playerB.map((count) => Math.abs(count - expected))),
    [result.playerB, expected],
  );

  const handleResimulate = () => {
    setResult(simulateRps(ROUNDS));
  };

  return (
    <div className="space-y-6 px-6 py-10">
      <HeaderTitle
        title="GTO とナッシュ均衡を体感する"
        description="じゃんけんを 1000 回繰り返すと、均衡戦略がどう見えるかを観察します。"
      />

      <section className="space-y-3 text-muted-foreground text-sm">
        <p>
          じゃんけんのナッシュ均衡は「グー・チョキ・パーを 1/3
          ずつ出す」混合戦略です。 2
          人がこの戦略を取ると、どの手も同じ期待値になり、相手から搾取されません。
        </p>
        <p>
          GTO (Game Theory Optimal)
          戦略とは、このように相手に依存せず均衡が保たれる
          プレイを指します。偏りが小さいほど、GTO に近い状態だと考えられます。
        </p>
        <p>
          下のシミュレーションは、2 人が完全にランダムに 1000
          回じゃんけんをした結果です。 分布が 1/3
          に近づくほど、均衡に近い動きになります。
        </p>
      </section>

      <section className="rounded-xl border bg-card/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">1000 回のじゃんけんを実行</p>
            <p className="text-muted-foreground text-xs">
              毎回ランダムで 2 人分の手を生成します
            </p>
          </div>
          <Button size="sm" onClick={handleResimulate}>
            もう一度まわす
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
          <p>
            試行回数: <span className="font-semibold">{ROUNDS}</span>
          </p>
          <p>
            期待値 (1/3):{" "}
            <span className="font-semibold">{expected.toFixed(1)}</span>
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">プレイヤー A の手の分布</h2>
          <div className="space-y-3">
            {HANDS.map((hand, index) => {
              const count = result.playerA[index];
              const percent = (count / ROUNDS) * 100;
              return (
                <div key={`a-${hand}`} className="flex items-center gap-3">
                  <div className="w-12 font-semibold text-sm">{hand}</div>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-28 whitespace-nowrap text-right text-sm tabular-nums">
                    {count} 回 ({percent.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/80 p-3 text-emerald-900 text-xs">
            最大の偏り: {maxDeviationA.toFixed(0)} 回
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">プレイヤー B の手の分布</h2>
          <div className="space-y-3">
            {HANDS.map((hand, index) => {
              const count = result.playerB[index];
              const percent = (count / ROUNDS) * 100;
              return (
                <div key={`b-${hand}`} className="flex items-center gap-3">
                  <div className="w-12 font-semibold text-sm">{hand}</div>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-sky-500 transition-[width] duration-700 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-28 whitespace-nowrap text-right text-sm tabular-nums">
                    {count} 回 ({percent.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-sky-200/70 bg-sky-50/80 p-3 text-sky-900 text-xs">
            最大の偏り: {maxDeviationB.toFixed(0)} 回
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">勝敗の内訳</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>プレイヤー A の勝ち</span>
              <span className="font-semibold tabular-nums">
                {result.outcomes.aWin} 回 (
                {((result.outcomes.aWin / ROUNDS) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>引き分け</span>
              <span className="font-semibold tabular-nums">
                {result.outcomes.draw} 回 (
                {((result.outcomes.draw / ROUNDS) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>プレイヤー B の勝ち</span>
              <span className="font-semibold tabular-nums">
                {result.outcomes.bWin} 回 (
                {((result.outcomes.bWin / ROUNDS) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/40 p-5 text-muted-foreground text-sm">
          <h2 className="font-semibold text-foreground">均衡の見方</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>3 つの手がほぼ同じ割合なら、相手は読みづらい状態</li>
            <li>勝ち / 引き分け / 負けが 1/3 前後なら、期待値は横並び</li>
            <li>大きく偏る試行が出ても、長期的には 1/3 に寄りやすい</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

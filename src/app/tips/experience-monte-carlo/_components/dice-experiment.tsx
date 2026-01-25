"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

const FACES = [1, 2, 3, 4, 5, 6] as const;
const ROLL_OPTIONS = [100, 1000, 10000] as const;

const rollDice = (count: number) => {
  const buckets = Array.from({ length: 6 }, () => 0);
  for (let i = 0; i < count; i += 1) {
    const face = Math.floor(Math.random() * 6);
    buckets[face] += 1;
  }
  return buckets;
};

export const DiceExperiment = () => {
  const [rollCount, setRollCount] = useState<(typeof ROLL_OPTIONS)[number]>(
    ROLL_OPTIONS[0],
  );
  const [buckets, setBuckets] = useState<number[]>(
    Array.from({ length: 6 }, () => 0),
  );
  const expected = rollCount / 6;
  const maxDeviation = Math.max(
    ...buckets.map((count) => Math.abs(count - expected)),
  );
  const maxDeviationPct = (maxDeviation / rollCount) * 100;

  useEffect(() => {
    setBuckets(rollDice(ROLL_OPTIONS[0]));
  }, []);

  return (
    <>
      <section className="space-y-8">
        <TipsText>
          モンテカルロ法とは、ひたすらその試行を繰り返すことで確率や期待値を推定する方法のことです。
          つまり、むずかしい計算式を考えずにゴリ押しで確率を求めることができます！
          当然試行回数が少ないと、推定した確率の正確さは低くなります。
          試しにサイコロを100回、1000回、10000回と振ったときの出目の数を見てみましょう
          🎲
        </TipsText>

        <TipsCard size="sm" className="rounded-xl bg-card/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">試行回数を選ぶ</p>
              <p className="text-muted-foreground text-xs">
                回数を増やすほど、理論値への近似が安定します
              </p>
            </div>
            <div className="rounded-full bg-muted/70 p-1">
              <div className="flex flex-wrap gap-1">
                {ROLL_OPTIONS.map((count) => (
                  <Button
                    key={count}
                    size="sm"
                    className={
                      count === rollCount
                        ? "rounded-full px-4"
                        : "rounded-full px-4 text-muted-foreground"
                    }
                    variant={count === rollCount ? "default" : "ghost"}
                    onClick={() => {
                      setRollCount(count);
                      setBuckets(rollDice(count));
                    }}
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <p className="text-muted-foreground">
              現在の試行回数: <span className="font-semibold">{rollCount}</span>
            </p>
            <p className="text-muted-foreground">
              偏りの最大値: {maxDeviation.toFixed(0)} 回
            </p>
          </div>
        </TipsCard>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <TipsCard className="space-y-4">
          <h2 className="font-semibold">出目の分布 (実験結果)</h2>
          <div className="space-y-3">
            {FACES.map((face, index) => {
              const count = buckets[index];
              const percent = (count / rollCount) * 100;
              return (
                <div key={face} className="flex items-center gap-3">
                  <div className="w-10 font-semibold text-sm">{face}</div>
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
        </TipsCard>

        <TipsCard className="space-y-4">
          <h2 className="font-semibold">理論値との比較</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>
              理論値: {rollCount} ÷ 6 ≒ {expected.toFixed(1)} 回 / 1 つの目
            </li>
            <li>試行回数を増やすほど、回数は 1/6 に近づきやすくなる</li>
            <li>
              {rollCount} 回程度でも、数十回の偏りは普通に起きる (偶然のゆらぎ)
            </li>
          </ul>
          <div className="rounded-lg border border-amber-300/70 bg-amber-50/80 p-3 text-amber-900 text-sm">
            理論値との差の最大: {maxDeviation.toFixed(0)} 回 (
            {maxDeviationPct.toFixed(2)}%)
          </div>
          <div className="rounded-md bg-muted/60 p-3 text-muted-foreground text-xs">
            実戦での意思決定では、同じ確率でも短期的にブレることを前提に考えるのがコツです。
          </div>
        </TipsCard>
      </section>
    </>
  );
};

"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Slider } from "@/components/shadcn/slider";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";
import { cn } from "@/lib/utils";

const formatPct = (value: number) => `${value.toFixed(1)}%`;

const ratioRows = [
  { ratioLabel: "10%", ratioValue: 0.1, isCommon: false },
  { ratioLabel: "25%", ratioValue: 0.25, isCommon: false },
  { ratioLabel: "33%", ratioValue: 0.33, isCommon: true },
  { ratioLabel: "50%", ratioValue: 0.5, isCommon: true },
  { ratioLabel: "66%", ratioValue: 0.66, isCommon: true },
  { ratioLabel: "75%", ratioValue: 0.75, isCommon: true },
  { ratioLabel: "100%", ratioValue: 1, isCommon: true },
  { ratioLabel: "120%", ratioValue: 1.2, isCommon: false },
  { ratioLabel: "150%", ratioValue: 1.5, isCommon: false },
  { ratioLabel: "200%", ratioValue: 2, isCommon: false },
];

export const Main = () => {
  const [potSize, setPotSize] = useState(100);
  const [selectedRatio, setSelectedRatio] = useState(ratioRows[3].ratioValue);

  const selectedRow = useMemo(
    () => ratioRows.find((row) => row.ratioValue === selectedRatio),
    [selectedRatio],
  );
  const requiredWinRate = selectedRatio / (1 + selectedRatio);
  const betAmount = potSize * selectedRatio;

  return (
    <section className="space-y-6">
      <TipsText>
        ポットを 1
        としたときのベット額に対して、コール側が必要とする勝率を一覧にしています。
        ベット額が大きいほど、相手に要求する必要勝率は高くなります。
      </TipsText>

      <TipsCard className="space-y-4">
        <div>
          <h2 className="font-semibold">インタラクティブ計算</h2>
          <p className="text-muted-foreground text-xs">
            ポットサイズを動かして必要勝率を確認します。
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ポットサイズ</span>
            <span className="font-semibold tabular-nums">{potSize}</span>
          </div>
          <Slider
            value={[potSize]}
            onValueChange={(value) => setPotSize(value[0])}
            min={1}
            max={500}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">
            ベット割合を選択してください。
          </p>
          <div className="flex flex-wrap gap-2">
            {ratioRows.map((row) => {
              const isActive = row.ratioValue === selectedRatio;
              return (
                <Button
                  key={row.ratioLabel}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRatio(row.ratioValue)}
                  className={cn(
                    "h-8 px-3 text-xs",
                    isActive &&
                      "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-50",
                  )}
                >
                  {row.ratioLabel}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md bg-muted/60 p-3">
            <p className="text-muted-foreground text-xs">選択したベット割合</p>
            <p className="mt-1 font-semibold">{selectedRow?.ratioLabel}</p>
          </div>
          <div className="rounded-md bg-muted/60 p-3">
            <p className="text-muted-foreground text-xs">ベット額</p>
            <p className="mt-1 font-semibold tabular-nums">
              {betAmount.toFixed(1)}
            </p>
          </div>
          <div className="rounded-md bg-muted/60 p-3">
            <p className="text-muted-foreground text-xs">必要勝率</p>
            <p className="mt-1 font-semibold tabular-nums">
              {formatPct(requiredWinRate * 100)}
            </p>
          </div>
        </div>
      </TipsCard>

      <TipsCard className="space-y-3">
        <div>
          <h2 className="font-semibold">ベット割合と必要勝率</h2>
          <p className="text-muted-foreground text-xs">
            よく使われるサイズは背景色で強調しています。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-muted-foreground text-xs uppercase">
              <tr>
                <th className="py-2 pr-3">ベット割合</th>
                <th className="py-2 pr-3">必要勝率</th>
              </tr>
            </thead>
            <tbody>
              {ratioRows.map((row) => {
                const required = row.ratioValue / (1 + row.ratioValue);
                return (
                  <tr
                    key={row.ratioLabel}
                    className={`border-b last:border-0 ${
                      row.isCommon ? "bg-amber-50/70" : ""
                    }`}
                  >
                    <td className="py-2 pr-3 font-semibold">
                      {row.ratioLabel}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {formatPct(required * 100)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TipsCard>

      <section className="grid gap-4 md:grid-cols-2">
        <TipsCard className="space-y-3 text-muted-foreground text-sm">
          <h2 className="font-semibold text-foreground">
            相手に勝率を突きつける
          </h2>
          <p>
            ベットは相手に必要勝率を要求する行動です。例えば 75% ポットの
            ベットは約 43%
            の勝率を求めるため、弱いレンジには強い圧力になります。
          </p>
        </TipsCard>
        <TipsCard className="space-y-3 text-muted-foreground text-sm">
          <h2 className="font-semibold text-foreground">コール判断に使う</h2>
          <p>
            相手のベットサイズから必要勝率を逆算し、自分の推定勝率が上回るかで
            コールの可否を判断します。推定が足りないならフォールドが合理的です。
          </p>
        </TipsCard>
      </section>
    </section>
  );
};

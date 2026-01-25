"use client";

import { useState } from "react";
import { RangeTable } from "@/components/range-table";
import { Slider } from "@/components/shadcn/slider";
import { cn } from "@/lib/utils";
import type { RangeEquityEntry } from "@/lib/wasm/types";
import { toHandSymbol } from "@/utils/hand-range";

type Props = {
  rangeEquity: RangeEquityEntry[];
  hero?: string;
  className?: string;
};
export const RangeEquitiesReport = ({
  rangeEquity,
  hero,
  className,
}: Props) => {
  const [equity, setEquity] = useState(0);

  const data = rangeEquity
    .reduce(
      (acc, entry) => {
        const symbol = toHandSymbol(entry.hand);
        const existIndex = acc.findIndex((e) => e.symbol === symbol);
        if (existIndex !== -1) {
          const maxProb = Math.max(acc[existIndex].prob, entry.equity);
          acc.splice(existIndex, 1, {
            symbol,
            prob: maxProb,
          });

          return acc;
        } else {
          acc.push({
            symbol,
            prob: entry.equity,
          });

          return acc;
        }
      },
      [] as { symbol: string; prob: number }[],
    )
    .filter((entry) => entry.prob * 100 >= equity);

  const eqAve =
    data.length > 0
      ? data
          .filter((entry) => entry.prob * 100 >= equity)
          .reduce((acc, entry) => acc + entry.prob, 0) / data.length
      : 0;

  return (
    <div className={cn("mx-auto flex w-fit flex-col items-end", className)}>
      <div className="mb-4 flex w-full max-w-[320px] items-center">
        <Slider
          className="flex-1"
          value={[equity]}
          onValueChange={(value) => setEquity(value[0])}
        />
        <div className="w-12 text-right">{equity.toFixed(0)}%</div>
      </div>
      <RangeTable data={data} mark={hero ? toHandSymbol(hero) : undefined} />
      <div className="w-40">Range EQ: {(eqAve * 100).toFixed(2)}%</div>
    </div>
  );
};

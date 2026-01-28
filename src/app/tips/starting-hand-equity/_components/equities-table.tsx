"use client";

import { useState } from "react";
import { RangeTable } from "@/components/range-table";
import { Slider } from "@/components/shadcn/slider";
import { cn } from "@/lib/utils";
import { toHandSymbol } from "@/utils/hand-range";

type Props = {
  equities: {
    rank: number;
    hand: string;
    player2: number;
    player6: number;
    player10: number;
  }[];
  hero?: string;
  className?: string;
};
export const EquitiesTable = ({ equities, hero, className }: Props) => {
  const [equity, setEquity] = useState(0);

  const data = equities
    .map((entry) => ({
      symbol: entry.hand,
      prob: entry.player2 / 100,
    }))
    .filter((entry) => entry.prob * 100 >= equity);

  const eqAve =
    data.length > 0
      ? data
          .filter((entry) => entry.prob * 100 >= equity)
          .reduce((acc, entry) => acc + entry.prob, 0) / data.length
      : 0;

  return (
    <div className={cn("mx-auto flex w-fit flex-col items-end", className)}>
      <div className="w-36">Average: {(eqAve * 100).toFixed(2)}%</div>
      <RangeTable data={data} mark={hero ? toHandSymbol(hero) : undefined} />
      <div className="mt-2 flex w-full items-center">
        <Slider
          className="flex-1"
          max={100}
          value={[equity]}
          onValueChange={(value) => setEquity(value[0])}
        />
        <div className="w-12 text-right">{equity.toFixed(0)}%</div>
      </div>
    </div>
  );
};

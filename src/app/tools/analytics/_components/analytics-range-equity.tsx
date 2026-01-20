import { useState } from "react";
import { RangeTable } from "@/components/range-table";
import { Slider } from "@/components/ui/slider";
import { TabsContent } from "@/components/ui/tabs";
import type { RangeEquityEntry } from "@/lib/wasm/types";
import { toHandSymbol } from "@/utils/hand-range";

type Props = {
  tabValue: "hero-range" | "villain-range";
  rangeEquity: RangeEquityEntry[];
};
export const AnalyticsRangeEquity = ({ tabValue, rangeEquity }: Props) => {
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
    rangeEquity.reduce((acc, entry) => acc + entry.equity, 0) /
    rangeEquity.length;

  return (
    <TabsContent
      value={tabValue}
      className="flex min-h-full flex-col items-center justify-end"
    >
      <div className="mb-4 flex w-full max-w-[320px] items-center">
        <Slider
          className="flex-1"
          value={[equity]}
          onValueChange={(value) => setEquity(value[0])}
        />
        <div className="w-12 text-right">{equity.toFixed(0)}%</div>
      </div>
      <RangeTable data={data} />
      <div>Range EQ: {(eqAve * 100).toFixed(2)}%</div>
    </TabsContent>
  );
};

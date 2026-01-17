import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useHoldemStore } from "./_utils/state";

export const StoryReport = () => {
  const { story, street } = useHoldemStore();

  const chartData = useMemo(() => {
    const targetIndex =
      street === "flop"
        ? 0
        : street === "turn"
          ? 1
          : street === "river"
            ? 2
            : -1;
    const latest = targetIndex >= 0 ? story[targetIndex] : undefined;
    if (!latest) return [];

    const bucketSize = 10;
    const bucketCount = 100 / bucketSize;
    const heroBuckets = Array.from({ length: bucketCount }, () => 0);
    const villainBuckets = Array.from({ length: bucketCount }, () => 0);

    const fillBuckets = (entries: { equity: number }[], target: number[]) => {
      for (const entry of entries) {
        const pct = entry.equity * 100;
        const bucket = Math.min(
          bucketCount - 1,
          Math.max(0, Math.floor(pct / bucketSize)),
        );
        target[bucket] += 1;
      }
    };

    fillBuckets(latest.range.hero, heroBuckets);
    fillBuckets(latest.range.villain, villainBuckets);

    const heroTotal = heroBuckets.reduce((sum, value) => sum + value, 0) || 1;
    const villainTotal =
      villainBuckets.reduce((sum, value) => sum + value, 0) || 1;

    return Array.from({ length: bucketCount }, (_, index) => {
      const start = index * bucketSize;
      return {
        bucket: `${start}%-`,
        hero: (heroBuckets[index] / heroTotal) * 100,
        villain: (villainBuckets[index] / villainTotal) * 100,
      };
    });
  }, [story, street]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-muted-foreground text-sm">
        チャートを表示するためのデータがありません。
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="mb-2 text-center font-semibold text-sm">エクイティ分布</p>
      <ChartContainer
        className="h-72 w-full"
        config={{
          hero: { label: "Hero", color: "hsl(0 72% 51%)" },
          villain: { label: "Villain", color: "hsl(210 85% 45%)" },
        }}
      >
        <LineChart data={chartData} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" tickMargin={6} type="category" />
          <YAxis
            domain={[0, 100]}
            tickMargin={6}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => [
                  `${Number(value).toFixed(1)}%`,
                  item.name,
                ]}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="hero"
            stroke="var(--color-hero)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="villain"
            stroke="var(--color-villain)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};

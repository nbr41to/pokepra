import { useMemo } from "react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toHandSymbol } from "@/utils/hand-range";
import { useHoldemStore } from "./_utils/state";

const chartConfig = {
  hero: {
    label: "hero",
    color: "hsl(0 72% 51%)",
  },
  villain: {
    label: "villain",
    color: "hsl(210 85% 45%)",
  },
} satisfies ChartConfig;
const bucketSize = 5;

export const StoryReport = () => {
  const { story, street, hero } = useHoldemStore();

  const { data, heroPoint } = useMemo(() => {
    const targetIndex =
      street === "flop"
        ? 0
        : street === "turn"
          ? 1
          : street === "river"
            ? 2
            : -1;
    const latest = targetIndex >= 0 ? story[targetIndex] : undefined;
    if (!latest) return { data: [], heroPoint: null };

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

    let heroAccum = 0;
    let villainAccum = 0;

    const rows = Array.from({ length: bucketCount }, (_, index) => {
      heroAccum += heroBuckets[index] / heroTotal;
      villainAccum += villainBuckets[index] / villainTotal;
      return {
        equity: (index + 1) * bucketSize,
        hero: heroAccum * 100,
        villain: villainAccum * 100,
      };
    });

    const heroSymbol = toHandSymbol(hero);
    const heroRangeEntry = latest.range.hero.find(
      (entry) => toHandSymbol(entry.hand) === heroSymbol,
    );
    const heroEquity = (heroRangeEntry?.equity ?? latest.hero.equity) * 100;
    const heroBucket = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor(heroEquity / bucketSize)),
    );
    const heroCdf =
      (heroBuckets.slice(0, heroBucket + 1).reduce((sum, v) => sum + v, 0) /
        heroTotal) *
      100;

    return {
      data: rows,
      heroPoint: { equity: (heroBucket + 1) * bucketSize, cdf: heroCdf },
    };
  }, [story, street, hero]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-muted-foreground text-sm">
        チャートを表示するためのデータがありません。
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>エクイティ分布</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer className="px-2" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              top: 20,
              left: -8,
              right: 16,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              ticks={Array.from({ length: 6 }, (_, i) => i * 20)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            ></XAxis>
            <YAxis
              type="number"
              dataKey="equity"
              domain={[0, 100]}
              reversed
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            >
              <Label value="EQ" angle={0} position="top" offset={10} />
            </YAxis>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => [`${Number(value).toFixed(2)}%`, ""]}
                />
              }
            />
            <Line
              dataKey="hero"
              type="monotone"
              stroke="var(--color-hero)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="villain"
              type="monotone"
              stroke="var(--color-villain)"
              strokeWidth={2}
              dot={false}
            />
            {heroPoint && (
              <ReferenceDot
                x={heroPoint.cdf}
                y={heroPoint.equity}
                r={3}
                fill="var(--color-hero)"
                stroke="var(--color-hero)"
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

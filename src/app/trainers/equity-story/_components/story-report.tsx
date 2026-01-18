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

    const heroEquities = latest.range.hero
      .map((entry) => entry.equity * 100)
      .sort((a, b) => a - b);
    const villainEquities = latest.range.villain
      .map((entry) => entry.equity * 100)
      .sort((a, b) => a - b);

    const getEquityAtCdf = (cdf: number, equities: number[]) => {
      const count = equities.length;
      if (count === 0) return 0;
      if (count === 1) return equities[0];
      const pos = (cdf / 100) * (count - 1);
      const low = Math.floor(pos);
      const high = Math.ceil(pos);
      const ratio = pos - low;
      return equities[low] + (equities[high] - equities[low]) * ratio;
    };

    const getCdfAtEquity = (equity: number, equities: number[]) => {
      const count = equities.length;
      if (count === 0) return 0;
      if (count === 1) return 100;
      if (equity <= equities[0]) return 0;
      if (equity >= equities[count - 1]) return 100;
      const idx = equities.findIndex((value) => value >= equity);
      const prev = equities[idx - 1];
      const next = equities[idx];
      const ratio = (equity - prev) / (next - prev || 1);
      const pos = idx - 1 + ratio;
      return (pos / (count - 1)) * 100;
    };

    const pointCount = 100 / bucketSize;
    const rows = Array.from({ length: pointCount }, (_, index) => {
      const cdf = (index + 1) * bucketSize;
      return {
        cdf,
        hero: getEquityAtCdf(cdf, heroEquities),
        villain: getEquityAtCdf(cdf, villainEquities),
      };
    });

    const heroSymbol = toHandSymbol(hero);
    const heroRangeEntry = latest.range.hero.find(
      (entry) => toHandSymbol(entry.hand) === heroSymbol,
    );
    const heroEquity = (heroRangeEntry?.equity ?? latest.hero.equity) * 100;
    const heroCdf = getCdfAtEquity(heroEquity, heroEquities);

    return {
      data: rows,
      heroPoint: { equity: heroEquity, cdf: heroCdf },
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
            layout="horizontal"
            margin={{
              top: 20,
              left: -8,
              right: 16,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              type="number"
              dataKey="cdf"
              domain={[0, 100]}
              ticks={Array.from({ length: 6 }, (_, i) => i * 20)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            >
              <Label value="CDF" angle={0} position="top" offset={5} />
            </XAxis>
            <YAxis
              type="number"
              domain={[100, 0]}
              ticks={Array.from({ length: 6 }, (_, i) => i * 20)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            >
              <Label value="EQ" angle={0} position="top" offset={5} />
            </YAxis>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `CDF ${Number(label).toFixed(0)}%`}
                  formatter={(value, name) => [
                    `EQ ${Number(value).toFixed(0)}%`,
                    name,
                  ]}
                />
              }
            />
            <Line
              dataKey="hero"
              type="monotone"
              stroke="var(--color-hero)"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={400}
              animationEasing="ease-out"
            />
            <Line
              dataKey="villain"
              type="monotone"
              stroke="var(--color-villain)"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={400}
              animationEasing="ease-out"
            />
            {heroPoint && (
              <ReferenceDot
                x={heroPoint.cdf}
                y={heroPoint.equity}
                r={3}
                fill="var(--color-hero)"
                stroke="var(--color-hero)"
                isFront
                ifOverflow="extendDomain"
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

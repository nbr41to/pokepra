import { use, useMemo } from "react";
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TabsContent } from "@/components/ui/tabs";
import type { RangeVsRangePayload } from "@/lib/wasm/types";

const BUCKET_SIZE = 5;

const chartConfig = {
  hero: {
    label: "Hero",
    color: "hsl(0 72% 51%)",
  },
  villain: {
    label: "Villain",
    color: "hsl(210 85% 45%)",
  },
} satisfies ChartConfig;

type Props = {
  hero: string[];
  simRangeVsRangeEquityPromise: Promise<RangeVsRangePayload>;
};
export const AnalyticsHeroRangeVsVillainRange = ({
  hero,
  simRangeVsRangeEquityPromise,
}: Props) => {
  const result = use(simRangeVsRangeEquityPromise);

  // 勝率だけ抽出
  const heroEquity =
    result.hero.find((entry) => {
      return entry.hand.split(" ").every((card) => hero.includes(card));
    })?.equity || 0;

  const heroRangeEquity =
    result.hero.reduce((acc, entry) => acc + entry.equity, 0) /
    result.hero.length;
  const villainRangeEquity =
    result.villain.reduce((acc, entry) => acc + entry.equity, 0) /
    result.villain.length;
  const heroEquities = result.hero.map((entry) => entry.equity).sort();
  const villainEquities = result.villain.map((entry) => entry.equity).sort();

  // 累積分布データを作成
  const heroData = useMemo(() => {
    return heroEquities.map((equity) => {
      const rank = heroEquities.findIndex((e) => e >= equity);
      const pct = (rank / heroEquities.length) * 100;
      return { equity: equity * 100, pct };
    });
  }, [heroEquities]);

  const villainData = useMemo(() => {
    return villainEquities.map((equity) => {
      const rank = villainEquities.findIndex((e) => e >= equity);
      const pct = (rank / villainEquities.length) * 100;
      return { equity: equity * 100, pct };
    });
  }, [villainEquities]);

  // バケット集計
  const heroBuckets = useMemo(() => {
    const buckets = new Array(100 / BUCKET_SIZE).fill(0);
    heroData.forEach(({ equity }) => {
      const bucketIndex = Math.floor(equity / BUCKET_SIZE);
      buckets[bucketIndex]++;
    });
    return buckets;
  }, [heroData]);

  const villainBuckets = useMemo(() => {
    const buckets = new Array(100 / BUCKET_SIZE).fill(0);
    villainData.forEach(({ equity }) => {
      const bucketIndex = Math.floor(equity / BUCKET_SIZE);
      buckets[bucketIndex]++;
    });
    return buckets;
  }, [villainData]);

  return (
    <TabsContent
      value="compare-equity-distribution"
      className="flex h-full flex-col justify-end"
    >
      <ChartContainer config={chartConfig} className="h-60 w-[calc(100%-16px)]">
        <LineChart
          margin={{
            top: 32,
            left: -24,
            right: 0,
            bottom: 0,
          }}
          data={heroBuckets.map((_heroCount, idx) => ({
            distribution: (idx + 1) * BUCKET_SIZE,
            hero:
              (heroBuckets.slice(0, idx + 1).reduce((a, b) => a + b, 0) /
                heroData.length) *
              100,
            villain:
              (villainBuckets.slice(0, idx + 1).reduce((a, b) => a + b, 0) /
                villainData.length) *
              100,
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="distribution"
            type="number"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            dataKey="equity"
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          >
            <Label value="EQ(%)" offset={16} position="top" dx={16} />
          </YAxis>
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          >
            <Label
              value="Cumulative Frequency (%)"
              angle={-90}
              position="insideLeft"
              offset={-8}
            />
          </YAxis>
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={() => "Equity"}
                formatter={(value, name) => [
                  name,
                  ": ",
                  `${Number(value).toFixed(1)}%`,
                ]}
              />
            }
          />
          <ReferenceLine
            y={heroEquity * 100}
            stroke="var(--color-hero)"
            strokeDasharray="6 4"
            ifOverflow="extendDomain"
            label="Hero EQ"
          />
          <ReferenceLine
            y={heroRangeEquity * 100}
            stroke="var(--color-hero)"
            strokeDasharray="2 4"
            ifOverflow="extendDomain"
            label="Hero Range EQ"
          />
          <ReferenceLine
            y={villainRangeEquity * 100}
            stroke="var(--color-villain)"
            strokeDasharray="2 4"
            ifOverflow="extendDomain"
            label="Villain Range EQ"
          />
          <Line
            type="monotone"
            dataKey="hero"
            stroke="var(--color-hero)"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={400}
            animationEasing="ease-out"
          />
          <Line
            type="monotone"
            dataKey="villain"
            stroke="var(--color-villain)"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ChartContainer>
    </TabsContent>
  );
};

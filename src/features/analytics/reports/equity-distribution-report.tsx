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
} from "@/components/shadcn/chart";
import { cn } from "@/lib/utils";
import type { RangeVsRangePayload } from "@/lib/wasm-v1/types";

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

const getEquityAtPercentile = (pct: number, equities: number[]) => {
  const count = equities.length;
  if (count === 0) return 0;
  if (count === 1) return equities[0] * 100;
  const pos = (pct / 100) * (count - 1);
  const low = Math.floor(pos);
  const high = Math.ceil(pos);
  const ratio = pos - low;
  return (equities[low] + (equities[high] - equities[low]) * ratio) * 100;
};

/**
 * range vs range のエクイティ分布
 * hero vs range の勝率付き
 */
type Props = {
  heroEquity: number;
  rangeEquity: RangeVsRangePayload;
  className?: string;
};
export const EquityDistributionReport = ({
  heroEquity,
  rangeEquity,
  className,
}: Props) => {
  // 勝率だけ抽出
  const heroRangeEquity =
    rangeEquity.hero.reduce((acc, entry) => acc + entry.equity, 0) /
    rangeEquity.hero.length;
  const villainRangeEquity =
    rangeEquity.villain.reduce((acc, entry) => acc + entry.equity, 0) /
    rangeEquity.villain.length;
  const heroEquities = rangeEquity.hero.map((entry) => entry.equity).sort();
  const villainEquities = rangeEquity.villain
    .map((entry) => entry.equity)
    .sort();

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-60 w-[calc(100%-16px)]", className)}
    >
      <LineChart
        margin={{
          top: 32,
          left: -24,
          right: 0,
          bottom: 0,
        }}
        data={Array.from({ length: 100 }, (_, index) => {
          const distribution = index + 1;
          return {
            distribution,
            hero: getEquityAtPercentile(distribution, heroEquities),
            villain: getEquityAtPercentile(distribution, villainEquities),
          };
        })}
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
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_value, payload) => {
                const distribution = payload?.[0]?.payload?.distribution;
                return `Distribution ${Number(distribution ?? 0)}%`;
              }}
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
  );
};

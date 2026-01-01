"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import data from "./data.json";

export const description = "A bar chart with a custom label";

const chartConfig = {
  percent: {
    label: "Percent",
    color: "var(--chart-2)",
  },
  hands: {
    label: "Hands",
    color: "var(--chart-2)",
  },
  label: {
    label: "label",
    color: "var(--background)",
  },
} satisfies ChartConfig;

type Props = {};
export const DistributionChart = ({}: Props) => {
  const iteration = data.reduce((acc, item) => acc + item.count, 0);
  const _data = data.map((item) => ({
    ...item,
    hands: item.hands.length ?? 0,
    percent: item.hands.length
      ? ((item.count / iteration) * 100).toFixed(1)
      : 0,
  }));

  return (
    <ChartContainer config={chartConfig}>
      <BarChart
        accessibilityLayer
        data={_data}
        layout="vertical"
        margin={{
          right: 16,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          hide
        />
        <XAxis dataKey="percent" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value, name, item) => (
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                    </span>
                    <span className="font-medium font-mono text-foreground tabular-nums">
                      {value?.toLocaleString?.() ?? value}
                    </span>
                  </div>
                  {typeof item.payload.hands === "number" && (
                    <div className="flex items-center justify-between gap-2 text-muted-foreground">
                      <span>hands</span>
                      <span className="font-mono tabular-nums">
                        {item.payload.hands.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="percent"
          layout="vertical"
          fill="var(--color-percent)"
          radius={4}
        >
          <LabelList
            dataKey="name"
            position="insideLeft"
            offset={8}
            className="fill-(--color-label)"
            fontSize={12}
          />
          <LabelList
            dataKey="percent"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
            formatter={(value: number) => value + "%"}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
};

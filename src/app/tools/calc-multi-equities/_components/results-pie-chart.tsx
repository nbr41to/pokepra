"use client";

import { useTheme } from "next-themes";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Combo } from "@/components/combo";
import { cn } from "@/lib/utils";

type ResultEntry = {
  hand: string;
  equity: number;
};

type Props = {
  data: ResultEntry[];
  heroHand?: string;
};

const HERO_COLOR = {
  light: "#ef4444",
  dark: "#b91c1c",
};
const COLORS = {
  light: ["#fb923c", "#4ade80", "#60a5fa", "#f472b6", "#facc15", "#38bdf8"],
  dark: ["#9a3412", "#166534", "#1e3a8a", "#9d174d", "#92400e", "#0c4a6e"],
};

const toHand = (hand: string) => hand.split(" ").filter(Boolean);
const normalizeHand = (hand: string) => toHand(hand).join(" ");
const withAlpha = (hex: string, alpha: number) => {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ResultsPieChart = ({ data, heroHand }: Props) => {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const heroColor = HERO_COLOR[theme];
  const palette = COLORS[theme];

  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">No results.</p>;
  }

  const normalizedHero = heroHand ? normalizeHand(heroHand) : "";
  const chartData = data
    .map((row, index) => ({
      name: normalizeHand(row.hand),
      value: row.equity * 100,
      isHero:
        normalizeHand(row.hand) === normalizedHero && normalizedHero !== "",
      fallbackIndex: index,
    }))
    .sort((a, b) => {
      if (a.isHero) return -1;
      if (b.isHero) return 1;
      return b.value - a.value;
    });

  return (
    <div className="w-full">
      <div className="h-120 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={110}
              paddingAngle={2}
              labelLine={false}
              label={({ value }) => `${Number(value).toFixed(1)}%`}
              stroke={theme === "dark" ? "#111827" : "#ffffff"}
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.isHero ? heroColor : palette[index % palette.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
            <Legend
              verticalAlign="top"
              content={({ payload }) => (
                <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
                  {payload?.map((entry) => {
                    const name = String(entry.value ?? "");
                    const hand = toHand(name);
                    const payloadData = entry.payload as
                      | { value?: number; isHero?: boolean }
                      | undefined;
                    const value = Number(payloadData?.value ?? 0);
                    const isHero = Boolean(payloadData?.isHero);
                    const color = isHero ? heroColor : (entry.color as string);

                    return (
                      <div
                        key={name}
                        className={cn(
                          "flex items-center gap-2 rounded-full border-2 border-border/60 px-2 py-1 text-foreground",
                          isHero && "border-red-400 dark:border-red-900",
                        )}
                        style={{
                          backgroundColor: withAlpha(color, 0.16),
                        }}
                      >
                        <Combo className="scale-75" hand={hand} />
                        <span className="font-bold">{value.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

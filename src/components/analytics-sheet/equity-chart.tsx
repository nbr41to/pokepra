import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { Combo } from "../combo";

type Props = {
  result: CombinedPayload;
  step?: number;
};

export const EquityChart = ({ result, step = 10 }: Props) => {
  const buckets = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(100 / step) },
        (_, i) => 100 - step * (i + 1),
      ),
    [step],
  ); // 90,80,...0 (high → low)
  const heroEntry = result.data.find((data) => data.hand === result.hand);
  const heroEq =
    heroEntry && heroEntry.count > 0
      ? ((heroEntry.win + heroEntry.tie / 2) / heroEntry.count) * 100
      : 0;
  const heroBucketStart = Math.min(
    100 - step,
    Math.max(0, Math.floor(heroEq / step) * step),
  );
  const eqThresholds = useMemo(
    () =>
      result.data.reduce<Record<number, { count: number; eq: number[] }>>(
        (acc, cur) => {
          const eq = ((cur.win + cur.tie / 2) / cur.count) * 100;
          const key = Math.min(100 - step, Math.floor(eq / step) * step);
          acc[key].count = acc[key].count + 1;
          acc[key].eq.push(eq);
          return acc;
        },
        Object.fromEntries(
          buckets.map((b) => [b, { count: 0, eq: [] }]),
        ) as Record<number, { count: number; eq: number[] }>,
      ),
    [buckets, result.data, step],
  );
  const eqAve = useMemo(() => {
    const totalEntries = result.data.length;
    if (totalEntries === 0) return 0;
    const totalEq = result.data.reduce((sum, cur) => {
      const eq = ((cur.win + cur.tie / 2) / cur.count) * 100;
      return sum + eq;
    }, 0);

    return totalEq / totalEntries;
  }, [result.data]);

  const [heroOffsetPct, setHeroOffsetPct] = useState(0);
  const [animateHero, setAnimateHero] = useState(false);

  useEffect(() => {
    if (result.data.length === 0) {
      setHeroOffsetPct(0);
      setAnimateHero(false);
      return;
    }
    let offset = 0;
    for (const bucket of buckets) {
      const value = eqThresholds[bucket]?.count ?? 0;
      const percent = (value / result.data.length) * 100;
      if (bucket === heroBucketStart) {
        const intraHeight = ((bucket + step - heroEq) / step) * percent;
        offset += intraHeight;
        break;
      }
      offset += percent;
    }
    setHeroOffsetPct(offset);
    setAnimateHero(false);
    const frame = requestAnimationFrame(() => setAnimateHero(true));
    return () => cancelAnimationFrame(frame);
  }, [
    buckets,
    eqThresholds,
    heroBucketStart,
    heroEq,
    result.data.length,
    step,
  ]);

  return (
    <div>
      <p className="text-center text-sm">EQ Ave. {eqAve.toFixed(1)}%</p>
      <div className="mx-auto flex w-fit pt-4 pb-24">
        <div className="relative h-72 w-10 rounded-[3px] border border-gray-300 dark:border-gray-600">
          {buckets.map((bucket, idx) => {
            const value = eqThresholds[bucket].count;
            if (value === 0) return null;
            const percent = (value / result.data.length) * 100;

            return (
              <div
                key={bucket}
                className={cn(
                  "relative flex w-full items-center justify-center text-xs",
                  bgColors[idx % bgColors.length],
                  idx === 0 ? "rounded-t-xs" : "",
                  idx === buckets.length - 1 ? "rounded-b-xs" : "",
                )}
                style={{
                  height: `${percent}%`,
                }}
              >
                {/* eq step */}
                <div
                  className={cn(
                    "absolute top-1/2 left-0 z-10 -translate-x-full -translate-y-1/2 pr-2 font-bold",
                    colors[idx % colors.length],
                  )}
                >
                  {bucket}%~
                </div>
              </div>
            );
          })}
          {heroEntry && (
            <div
              className={cn(
                "absolute -right-28 flex items-center gap-1 text-foreground text-sm",
                animateHero && "hero-eq-indicator",
              )}
              style={
                {
                  "--hero-target": `${heroOffsetPct}%`,
                  // top: `${heroOffsetPct}%`,
                } as CSSProperties
              }
            >
              <div className="absolute -left-16 pt-4">
                <Combo className="" hand={result.hand.split(" ")} />
                <div className="text-center font-bold">
                  {heroEq.toFixed(1)}%
                </div>
              </div>
              <span className="h-px w-52 bg-pink-400 dark:bg-pink-700" />
            </div>
          )}
          {/* Ave */}
        </div>
        <div className="relative -z-10 w-8">
          {Array.from({ length: 100 / step + 1 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: Static tick marks are stable.
              key={i}
              className="absolute -left-1 h-px w-8 bg-gray-300 dark:bg-gray-600"
              style={{
                bottom: i === 100 / step ? "calc(100% - 1px)" : `${step * i}%`,
              }}
            >
              <p className="absolute -top-2 left-9 whitespace-nowrap text-xs">
                {step * i}%{" "}
                {i === 100 / step && `(${result.data.length} hands)`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const colors = [
  "text-red-500 dark:text-red-700",
  "text-orange-500 dark:text-orange-600",
  "text-yellow-300 dark:text-yellow-500",
  "text-amber-400 dark:text-amber-600",
  "text-green-400 dark:text-green-700",
  "text-lime-300 dark:text-lime-600",
  "text-blue-600 dark:text-blue-700",
  "text-sky-500 dark:text-sky-700",
  "text-purple-500 dark:text-purple-700",
  "text-gray-600 dark:text-gray-700",
];

const bgColors = [
  "bg-red-500 dark:bg-red-700",
  "bg-orange-500 dark:bg-orange-600",
  "bg-yellow-300 dark:bg-yellow-500",
  "bg-amber-400 dark:bg-amber-600",
  "bg-green-400 dark:bg-green-700",
  "bg-lime-300 dark:bg-lime-600",
  "bg-blue-600 dark:bg-blue-700",
  "bg-sky-500 dark:bg-sky-700",
  "bg-purple-500 dark:bg-purple-700",
  "bg-gray-600 dark:bg-gray-700",
];

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Combo } from "@/components/combo";
import { cn } from "@/lib/utils";
import type { CombinedPayload, EquityPayload } from "@/lib/wasm-v1/simulation";

/**
 * hero vs range の勝率の分布チャート
 */
type Props = {
  payload: CombinedPayload | EquityPayload;
  step?: number;
};

export const EquityReport = ({ payload, step = 10 }: Props) => {
  const buckets = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(100 / step) },
        (_, i) => 100 - step * (i + 1),
      ),
    [step],
  ); // 90,80,...0 (high → low)
  const heroEq = payload.equity * 100;
  const heroBucketStart = Math.min(
    100 - step,
    Math.max(0, Math.floor(heroEq / step) * step),
  );
  const eqThresholds = useMemo(
    () =>
      payload.data.reduce<Record<number, { count: number; eq: number[] }>>(
        (acc, cur) => {
          let eq: number;
          if ("equity" in cur) {
            eq = cur.equity * 100;
          } else {
            eq = ((cur.win + cur.tie / 2) / cur.count) * 100;
          }
          const key = Math.min(100 - step, Math.floor(eq / step) * step);
          acc[key].count = acc[key].count + 1;
          acc[key].eq.push(eq);
          return acc;
        },
        Object.fromEntries(
          buckets.map((b) => [b, { count: 0, eq: [] }]),
        ) as Record<number, { count: number; eq: number[] }>,
      ),
    [buckets, payload.data, step],
  );
  const eqAve = useMemo(() => {
    const totalEntries = payload.data.length;
    if (totalEntries === 0) return 0;
    const totalEq = payload.data.reduce((sum, cur) => {
      let eq: number;
      if ("equity" in cur) {
        eq = cur.equity * 100;
      } else {
        eq = ((cur.win + cur.tie / 2) / cur.count) * 100;
      }
      return sum + eq;
    }, 0);

    return totalEq / totalEntries;
  }, [payload.data]);

  const [heroOffsetPct, setHeroOffsetPct] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (payload.data.length === 0) {
      setHeroOffsetPct(0);
      return;
    }
    let offset = 0;
    for (const bucket of buckets) {
      const value = eqThresholds[bucket]?.count ?? 0;
      const percent = (value / payload.data.length) * 100;
      if (bucket === heroBucketStart) {
        const intraHeight = ((bucket + step - heroEq) / step) * percent;
        offset += intraHeight;
        break;
      }
      offset += percent;
    }
    setHeroOffsetPct(offset);
  }, [
    buckets,
    eqThresholds,
    heroBucketStart,
    heroEq,
    payload.data.length,
    step,
  ]);

  useEffect(() => {
    if (hasAnimated || payload.data.length === 0) return;
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1100);
    return () => clearTimeout(timer);
  }, [hasAnimated, payload.data.length]);

  const maxBetSize = (heroEq / (100 - heroEq)) * 100;

  return (
    <div className="w-full">
      <p className="text-center text-sm">EQ Ave. {eqAve.toFixed(1)}%</p>
      <div className="mx-auto flex w-fit pt-4 pb-6">
        <div className="relative h-72 w-10 rounded-[3px] border border-gray-300 dark:border-gray-600">
          {buckets.map((bucket, idx) => {
            const value = eqThresholds[bucket].count;
            const percent =
              payload.data.length === 0
                ? 0
                : (value / payload.data.length) * 100;

            return (
              <div
                key={bucket}
                className={cn(
                  "relative flex w-full items-center justify-center text-xs transition-[height] duration-500 ease-out",
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
                    value === 0 && "opacity-0",
                  )}
                >
                  {bucket}%~
                </div>
              </div>
            );
          })}
          {/* Hero Equity */}
          <div
            className={cn(
              "absolute -right-28 flex items-center gap-1 text-foreground text-sm transition-[top] duration-500 ease-out",
              !hasAnimated && "hero-eq-indicator",
            )}
            style={
              {
                "--hero-target": `${heroOffsetPct}%`,
                top: `${heroOffsetPct}%`,
              } as CSSProperties
            }
          >
            <div className="absolute -left-16 pt-4">
              <Combo className="" hand={payload.hand.split(" ")} />
              <div className="text-center font-bold">{heroEq.toFixed(1)}%</div>
            </div>
            <span className="h-px w-52 bg-pink-400 dark:bg-pink-700" />
          </div>
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
                {i === 100 / step && `(${payload.data.length} hands)`}
              </p>
            </div>
          ))}
        </div>
      </div>
      <p className="pr-2 text-right text-muted-foreground text-xs">
        POTの
        <span className="px-px font-bold">{maxBetSize.toFixed(2)}%</span>
        のベットまでEV+
      </p>
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

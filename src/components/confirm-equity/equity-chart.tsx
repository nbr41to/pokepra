import { use } from "react";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { Combo } from "../combo";

type Props = {
  promise: Promise<CombinedPayload>;
  step?: number;
};

export const EquityChart = ({ promise, step = 10 }: Props) => {
  const ranks = use(promise);
  const buckets = Array.from(
    { length: Math.ceil(100 / step) },
    (_, i) => 100 - step * (i + 1),
  ); // 90,80,...0 (high → low)
  const heroEq =
    (((ranks.data.find((data) => data.hand === ranks.hand)?.win ?? 0) +
      (ranks.data.find((data) => data.hand === ranks.hand)?.tie ?? 0) / 2) /
      (ranks.data.find((data) => data.hand === ranks.hand)?.count ?? 1)) *
    100;
  const heroBucketStart = Math.min(
    100 - step,
    Math.max(0, Math.floor(heroEq / step) * step),
  );
  const eqThresholds = ranks.data.reduce<
    Record<number, { count: number; eq: number[] }>
  >(
    (acc, cur) => {
      const eq = ((cur.win + cur.tie / 2) / cur.count) * 100;
      const key = Math.min(100 - step, Math.floor(eq / step) * step);
      acc[key].count = (acc[key]?.count ?? 0) + 1;
      acc[key].eq.push(eq);
      return acc;
    },
    Object.fromEntries(buckets.map((b) => [b, { count: 0, eq: [] }])) as Record<
      number,
      { count: number; eq: number[] }
    >,
  );

  return (
    <div className="mx-auto w-fit pb-24">
      <div className="relative h-80 w-10 rounded-[3px] border border-gray-300 dark:border-gray-600">
        {buckets.map((bucket, idx) => {
          const value = eqThresholds[bucket].count;
          if (value === 0) return null;
          const percent = (value / ranks.data.length) * 100;
          const heroInBucket = heroBucketStart === bucket ? heroEq : null;

          // position from top: sum of previous bucket heights + intra-bucket ratio
          const prevHeight = buckets
            .slice(0, idx)
            .reduce(
              (acc, b) =>
                acc + (eqThresholds[b].count / ranks.data.length) * 100,
              0,
            );
          const intraHeight =
            heroInBucket === null
              ? 0
              : ((heroInBucket - bucket) / step) * percent;
          const heroOffsetPct = prevHeight + intraHeight;

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
              {/* measure */}
              <span
                className={cn(
                  "absolute -bottom-px -left-1.5 h-px w-12 bg-gray-300 dark:bg-gray-600",
                  idx === buckets.length - 1 && "hidden",
                )}
              />
              {/* eq step */}
              <div
                className={cn(
                  "absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2 font-bold",
                  colors[idx % colors.length],
                )}
              >
                {bucket}%~
              </div>
              {/* eq density */}
              <div className="absolute top-1/2 right-0 z-10 translate-x-full -translate-y-1/2 pl-2">
                {percent.toFixed(1)}%
              </div>
              {/* hero eq indicator */}
              <div
                className={cn(
                  "absolute left-0 flex -translate-y-1/2 items-center gap-1 text-foreground text-sm",
                  heroInBucket === null && "hidden",
                )}
                style={{ top: `${heroOffsetPct}%` }}
              >
                <span className="h-px w-24 bg-pink-400 dark:bg-pink-700" />
                <div>
                  <Combo className="" hand={ranks.hand.split(" ")} />
                  <div className="text-center font-bold">
                    {heroEq.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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

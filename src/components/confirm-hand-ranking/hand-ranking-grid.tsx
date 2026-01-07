import { useEffect } from "react";
import { Combo } from "@/components/combo";
import { getShortHandName } from "@/lib/poker/pokersolver";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";

type Props = {
  result: CombinedPayload;
  onScroll: () => void;
};

export const HandRankingGrid = ({ result, onScroll }: Props) => {
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  return (
    <div className="grid grid-cols-3 gap-1">
      {result.data.map(({ hand, win, tie, count, results }, index) => (
        <div
          key={hand}
          id={hand}
          className={cn(
            "flex justify-between gap-x-1 rounded border p-2",
            hand === result.hand &&
              "border-2 border-orange-500 bg-orange-100 dark:bg-orange-900",
          )}
        >
          <div className="h-full space-y-2">
            <div className="text-sm/[1]">{index + 1}.</div>
            <Combo className="w-12 scale-80" hand={hand.split(" ")} />
            <span className="text-xs">EV</span>
            <div className="text-center font-bold text-base">
              <span>
                {(((win + tie / 2) / count) * 100).toFixed(1).split(".")[0]}
              </span>
              <span className="text-xs">
                .{(((win + tie / 2) / count) * 100).toFixed(1).split(".")[1]}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {Object.keys(results)
              .filter((name) => results[name as keyof typeof results] > 0)
              .map((name) => {
                const probability = (
                  (results[name as keyof typeof results] / count) *
                  100
                ).toFixed(1);
                const colorClass =
                  Number(probability) >= 80
                    ? "bg-green-600 dark:bg-green-950"
                    : Number(probability) >= 60
                      ? "bg-green-500 dark:bg-green-900"
                      : Number(probability) >= 40
                        ? "bg-green-400 dark:bg-green-800"
                        : "bg-green-200 dark:bg-green-700";

                return (
                  <div
                    key={name}
                    className="relative z-10 flex h-fit justify-between gap-x-2 overflow-hidden rounded-xs border px-1 py-px text-[10px]/[1]"
                  >
                    <div>{getShortHandName(name)}</div>
                    <div>{results[name as keyof typeof results]}</div>
                    <div
                      className={`${colorClass} absolute top-0 left-0 -z-10 h-full`}
                      style={{ width: `${probability}%` }}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

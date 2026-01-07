import { useEffect } from "react";
import { Combo } from "@/components/combo";
import { getShortHandName } from "@/lib/poker/pokersolver";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";

type Props = {
  result: CombinedPayload;
  onScroll: () => void;
};

export const HandRankingList = ({ result, onScroll }: Props) => {
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  return (
    <div className="divide-y">
      {result.data.map(({ hand, win, tie, count, results }, index) => (
        <div
          key={hand}
          id={hand}
          className={cn(
            "grid grid-cols-[28px_52px_60px_1fr] items-center px-2 py-1",
            hand === result.hand && "bg-orange-200 dark:bg-orange-900",
          )}
        >
          <span className="w-10 text-sm">{index + 1}.</span>
          <Combo className="scale-75" hand={hand.split(" ")} />
          <div>
            <div className="text-center font-bold text-sm">
              {(((win + tie / 2) / count) * 100).toFixed(2)}%
            </div>
            <div className="text-right text-xs">
              ({((index / result.data.length) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="flex h-full flex-wrap gap-1 pl-2">
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
                    className="relative z-10 flex h-fit w-18 justify-between gap-x-2 overflow-hidden rounded-xs border px-1 py-px text-xs"
                  >
                    <div>{getShortHandName(name)}</div>
                    <div>{probability}%</div>
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

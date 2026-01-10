import { useEffect } from "react";
import { Combo } from "@/components/combo";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { HandProbability } from "../hand-probability";

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
      {result.data.map(({ hand, win, tie, count, results }, index) => {
        return (
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
              <span className="text-xs">EQ</span>
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
                  const probability =
                    (results[name as keyof typeof results] / count) * 100;

                  return (
                    <HandProbability
                      key={name}
                      className=""
                      handName={name}
                      probability={probability}
                    />
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

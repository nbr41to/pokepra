import { useEffect } from "react";
import { Combo } from "@/components/combo";
import { cn } from "@/lib/utils";
import type { CombinedPayload, HandRankingEntry } from "@/lib/wasm/simulation";
import { HandProbability } from "../hand-probability";

type Props = {
  result: CombinedPayload;
  ranking: HandRankingEntry[];
  onScroll: () => void;
};

export const ComboRanking = ({ result, ranking, onScroll }: Props) => {
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  return (
    <div className="divide-y pt-12 pb-24">
      {result.data
        .sort(
          (a, b) =>
            ranking.findIndex((r) => r.hand === a.hand) -
            ranking.findIndex((r) => r.hand === b.hand),
        )
        .map(({ hand, win, tie, count, results }, index) => (
          <div
            key={hand}
            id={hand}
            className={cn(
              "grid grid-cols-[24px_56px_60px_1fr] items-center px-2 py-1",
              hand === result.hand && "bg-orange-200 dark:bg-orange-900",
            )}
          >
            <span className="text-sm">{index + 1}.</span>
            <Combo className="scale-70" hand={hand.split(" ")} />
            <div>
              <div className="text-center font-bold text-sm">
                {(((win + tie) / count) * 100).toFixed(2)}%
              </div>
              <div className="text-right text-xs">
                ({((index / result.data.length) * 100).toFixed(1)}%)
              </div>
            </div>

            <div className="flex h-full flex-wrap gap-1 pl-2">
              {Object.keys(results)
                .filter((name) => {
                  const outcome = results[name as keyof typeof results];
                  return outcome.win + outcome.tie > 0;
                })
                .map((name) => {
                  const outcome = results[name as keyof typeof results];
                  const total = outcome.win + outcome.tie;
                  const probability = (total / count) * 100;

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
        ))}
    </div>
  );
};

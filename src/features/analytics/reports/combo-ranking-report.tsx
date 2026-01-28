import { useEffect } from "react";
import { Combo } from "@/components/combo";
import { cn } from "@/lib/utils";
import type { EquityPayload, HandRankingEntry } from "@/lib/wasm/simulation";

type Props = {
  payload: EquityPayload;
  ranking: HandRankingEntry[];
  onScroll?: () => void;
  className?: string;
};

export const ComboRankingReport = ({
  payload,
  ranking,
  onScroll,
  className,
}: Props) => {
  useEffect(() => {
    if (onScroll) {
      onScroll();
    }
  }, [onScroll]);

  return (
    <div className={cn("divide-y", className)}>
      {[...payload.data, { hand: payload.hand, equity: payload.equity }]
        .sort(
          (a, b) =>
            ranking.findIndex((r) => r.hand === a.hand) -
            ranking.findIndex((r) => r.hand === b.hand),
        )
        .map(({ hand, equity }, index) => (
          <div
            key={hand}
            id={hand}
            className={cn(
              "grid grid-cols-[24px_56px_60px_1fr] items-center px-2 py-1",
              hand === payload.hand && "bg-orange-200 dark:bg-orange-900",
            )}
          >
            <span className="text-sm">{index + 1}.</span>
            <Combo className="scale-70" hand={hand.split(" ")} />
            <div>
              <div className="text-center font-bold text-sm">
                {(equity * 100).toFixed(2)}%
              </div>
              <div className="text-right text-xs">
                ({((index / payload.data.length) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

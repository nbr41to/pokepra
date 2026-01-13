import { cn } from "@/lib/utils";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";
import { getInitialHandRangeArray } from "@/utils/hand-range";

type Props = {
  mark?: string;
};

export const RangeTable = ({ mark }: Props) => {
  return (
    <div className="space-y-3 font-noto-sans-jp">
      <div className="grid w-fit grid-cols-13 border-r border-b">
        {CARD_RANKS.map((_rank, rowIndex) => {
          const prefixRank = CARD_RANKS[rowIndex];
          return CARD_RANKS.map((rank, column) => {
            const orderedRanks = [prefixRank, rank]
              .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
              .join("");
            const ranksString =
              orderedRanks +
              (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
            const tier = getInitialHandRangeArray().findIndex((tier) =>
              tier.includes(ranksString),
            );

            return (
              <div
                key={rank}
                className={cn(
                  "grid h-6 w-8 place-items-center border-t border-l font-bold text-[11px] text-foreground",
                  tier === 0 &&
                    "bg-blue-900 text-background dark:bg-yellow-400",
                  tier === 1 && "bg-red-500 dark:bg-red-800",
                  tier === 2 && "bg-pink-300 dark:bg-pink-600",
                  tier === 3 && "bg-yellow-400 dark:bg-yellow-700",
                  tier === 4 && "bg-orange-500 dark:bg-orange-700",
                  tier === 5 && "bg-blue-500 dark:bg-blue-800",
                  tier === 6 && "bg-green-600 dark:bg-green-800",
                  tier === 7 && "bg-slate-400 dark:bg-slate-700",
                  tier === -1 && "bg-gray-300 opacity-40 dark:bg-gray-800",
                  mark === ranksString &&
                    "z-10 animate-pulse rounded outline-3 outline-teal-500 outline-offset-1",
                )}
              >
                {ranksString}
              </div>
            );
          });
        })}
      </div>
      <div className="grid w-fit grid-cols-8 gap-2">
        <div className="grid h-6 w-8 place-items-center border bg-blue-900 font-bold text-background text-xs dark:bg-yellow-400">
          8 ~
        </div>
        <div className="grid h-6 w-8 place-items-center border bg-red-500 font-bold text-xs dark:bg-red-800" />
        <div className="grid h-6 w-8 place-items-center border bg-pink-300 font-bold text-xs dark:bg-pink-600" />
        <div className="grid h-6 w-8 place-items-center border bg-yellow-400 font-bold text-xs dark:bg-yellow-700">
          6,7
        </div>
        <div className="grid h-6 w-8 place-items-center border bg-orange-500 font-bold text-xs dark:bg-orange-700">
          4,5
        </div>
        <div className="grid h-6 w-8 place-items-center border bg-blue-500 font-bold text-xs dark:bg-blue-800">
          3
        </div>
        <div className="grid h-6 w-8 place-items-center border bg-green-600 font-bold text-xs dark:bg-green-800">
          BTN
        </div>
        <div className="grid h-6 w-8 place-items-center border bg-slate-400 font-bold text-xs dark:bg-slate-700">
          BB*
        </div>
      </div>
    </div>
  );
};

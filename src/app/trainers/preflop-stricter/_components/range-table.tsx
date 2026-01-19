import { use } from "react";
import { cn } from "@/lib/utils";
import { CARD_RANK_ORDER, CARD_RANKS } from "@/utils/card";
import { toHandSymbol } from "@/utils/hand-range";

type Props = {
  combosPromise: Promise<string[][]>;
  hero?: string[];
};

export const RangeTable = ({ combosPromise, hero }: Props) => {
  const combos = use(combosPromise);
  const comboSymbols = new Set(combos.map((hand) => toHandSymbol(hand)));
  const heroSymbol = hero ? toHandSymbol(hero) : null;

  return (
    <div className="grid w-fit grid-cols-13 border-r border-b font-noto-sans-jp">
      {CARD_RANKS.map((_rank, rowIndex) => {
        const prefixRank = CARD_RANKS[rowIndex];
        return CARD_RANKS.map((rank, column) => {
          const orderedRanks = [prefixRank, rank]
            .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
            .join("");
          const ranksString =
            orderedRanks +
            (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
          const include = comboSymbols.has(ranksString);
          const isHero = heroSymbol === ranksString;

          return (
            <div
              key={rank}
              className={cn(
                "grid h-4 w-6 place-items-center border-t border-l font-bold text-[10px] text-foreground",
                include
                  ? "bg-green-400 dark:bg-green-700"
                  : "bg-gray-300 opacity-40 dark:bg-gray-800",
                isHero &&
                  "z-10 animate-pulse rounded outline-3 outline-red-500 outline-offset-1",
              )}
            >
              {ranksString}
            </div>
          );
        });
      })}
    </div>
  );
};

export const RangeTableSkeleton = () => (
  <div className="grid w-fit grid-cols-13 border-r border-b font-noto-sans-jp">
    {CARD_RANKS.map((_rank, rowIndex) => {
      const prefixRank = CARD_RANKS[rowIndex];
      return CARD_RANKS.map((rank, column) => {
        const orderedRanks = [prefixRank, rank]
          .sort((a, b) => CARD_RANK_ORDER[b] - CARD_RANK_ORDER[a])
          .join("");
        const ranksString =
          orderedRanks +
          (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");

        return (
          <div
            key={rank}
            className={cn(
              "grid h-4 w-6 place-items-center border-t border-l font-bold text-[10px] text-foreground",
              "bg-gray-300 opacity-40 dark:bg-gray-800",
            )}
          >
            {ranksString}
          </div>
        );
      });
    })}
  </div>
);

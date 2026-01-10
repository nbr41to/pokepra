"use client";

import { useState } from "react";
import { HeaderTitle } from "@/components/header-title";
import { Input } from "@/components/ui/input";
import { RANK_ORDER, RANKS } from "@/constants/card";
import { TIERS } from "@/constants/tiers";
import { cn } from "@/lib/utils";
import { getTierIndexByPosition } from "@/utils/preflop-range";

// export const metadata: Metadata = {
//   title: "Preflop Range",
// };

export default function Page() {
  const [position, setPosition] = useState<number>(1);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 py-8">
      <HeaderTitle title="Preflop Range" />

      <Input
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        type="number"
        min={1}
        max={9}
        className="w-20 text-center"
      />

      <div className="grid w-fit grid-cols-13 border-r border-b">
        {RANKS.map((_rank, rowIndex) => {
          const prefixRank = RANKS[rowIndex];
          return RANKS.map((rank, column) => {
            const orderedRanks = [prefixRank, rank]
              .sort((a, b) => RANK_ORDER[b] - RANK_ORDER[a])
              .join("");
            const ranksString =
              orderedRanks +
              (rank !== prefixRank ? (column < rowIndex ? "o" : "s") : "");
            const tier = TIERS.findIndex((tier) => tier.includes(ranksString));
            const tierIndex = getTierIndexByPosition(position);
            const isOpenRaise = tier !== -1 && tier <= tierIndex;

            return (
              <div
                key={rank}
                className={cn(
                  "grid h-6 w-8 place-items-center border-t border-l text-[11px] text-foreground",
                  isOpenRaise
                    ? "bg-red-500 dark:bg-red-800"
                    : "bg-blue-500 dark:bg-blue-800",
                )}
              >
                {ranksString}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { BIG_BLIND } from "./_utils/types";

type Props = {
  totalEvLoss: number;
  roundsPlayed: number;
  className?: string;
};

/**
 * 累積スコア表示
 * - 累積EV損失 (chips) と平均/ラウンド を表示
 */
export const ScoreBar = ({ totalEvLoss, roundsPlayed, className }: Props) => {
  const avgPerRound = roundsPlayed > 0 ? totalEvLoss / roundsPlayed : 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5 text-xs",
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="text-muted-foreground">累計EVロス</span>
        <span className="font-bold">
          {totalEvLoss > 0
            ? `-${(totalEvLoss / BIG_BLIND).toFixed(2)}BB`
            : "0BB"}
        </span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-muted-foreground">1ハンド平均</span>
        <span className="font-bold">
          {roundsPlayed === 0
            ? "-"
            : `${avgPerRound > 0 ? "-" : ""}${(avgPerRound / BIG_BLIND).toFixed(2)}BB`}
        </span>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-muted-foreground">ハンド数</span>
        <span className="font-bold">{roundsPlayed}</span>
      </div>
    </div>
  );
};

import { cn } from "@/lib/utils";
import { useFullStreetDefenseStore } from "./_utils/state";

export const CurrentBetting = () => {
  const {
    equityHidden,
    heroEquity,
    pot,
    callAmount,
    requiredEquity,
    expectedValue,
  } = useFullStreetDefenseStore();
  const betWidth = pot > 0 ? (callAmount / pot) * 96 : 0;

  return (
    <div className="flex items-end justify-between p-2">
      <div className="space-y-2">
        <div
          className="h-5 whitespace-nowrap rounded-full border bg-orange-400 pl-2 text-foreground text-xs/[20px] transition-[width] duration-300 ease-out dark:bg-orange-700"
          style={{ width: `${betWidth}px` }}
        >
          Bet: {callAmount.toFixed(1)}BB
        </div>
        <div className="h-5 w-24 rounded-full border bg-amber-300 pl-2 text-foreground text-xs/[20px] dark:bg-yellow-700">
          Pot: {pot.toFixed(1)}BB
        </div>
      </div>

      <div className="flex w-40 flex-col items-end text-sm">
        <div
          className={cn(
            "flex justify-between gap-x-2 whitespace-nowrap",
            equityHidden && "invisible",
          )}
        >
          <span>必要勝率:</span>
          <span className="w-14 text-right">
            {(requiredEquity * 100).toFixed(2)}%
          </span>
        </div>
        <div
          className={cn(
            "flex justify-between gap-x-2 whitespace-nowrap",
            equityHidden && "invisible",
          )}
        >
          <span>勝率:</span>
          <span className="w-14 text-right">
            {(heroEquity * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between gap-x-2 whitespace-nowrap">
          <span>EV:</span>
          <span
            className={cn(
              "w-14 text-right font-bold",
              expectedValue > 0 && "text-green-500",
              expectedValue < 0 && "text-red-500",
            )}
          >
            {expectedValue >= 0 ? "+" : ""}
            {expectedValue.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

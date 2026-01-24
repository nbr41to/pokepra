import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

export const CurrentBetting = () => {
  const { confirmedHand, equityHidden, heroEquity, pot, bet, delta } =
    useActionStore();

  return (
    <div className="flex items-end justify-between p-2">
      <div className="">
        {confirmedHand && (
          <div className="space-y-2">
            <div
              className="h-5 whitespace-nowrap rounded-full border bg-orange-400 pl-2 text-foreground text-xs/[20px] transition-[width] duration-300 ease-out dark:bg-orange-700"
              style={{
                width: `${(bet / pot) * 96}px`,
              }}
            >
              Bet: {bet}
            </div>

            <div className="h-5 w-24 rounded-full border bg-amber-300 pl-2 text-foreground text-xs/[20px] dark:bg-yellow-700">
              Pot: {pot}
            </div>
          </div>
        )}
      </div>

      <div className="flex w-32 flex-col items-end text-sm">
        <div
          className={cn(
            "flex justify-between gap-x-2",
            equityHidden && "invisible",
          )}
        >
          <span>必要勝率:</span>
          <span className="w-12">
            {((bet / (pot + bet)) * 100).toFixed(2)}%
          </span>
        </div>

        <div
          className={cn(
            "flex justify-between gap-x-2",
            equityHidden && "invisible",
          )}
        >
          <span>勝率:</span>
          <span className="w-12">{(heroEquity * 100).toFixed(2)}%</span>
        </div>

        <div className="flex justify-between gap-x-2">
          <span>差分:</span>
          <span
            className={cn(
              "w-12 font-bold",
              delta > 0 && "text-green-500",
              delta < 0 && "text-red-500",
            )}
          >
            {(delta * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

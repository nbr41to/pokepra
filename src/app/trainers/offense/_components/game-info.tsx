import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useOffenseStore } from "./_utils/state";

export const GameInfo = () => {
  const {
    pot,
    stack,
    delta,
    villains,
    action,
    selectedBetSize,
    requiredEquity,
    showdownEquity,
  } = useOffenseStore();

  const avgHeroEq =
    villains.length === 0
      ? 0
      : villains.reduce((sum, villain) => sum + villain.heroEquity, 0) /
        villains.length;

  return (
    <div className="space-y-2 px-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1 text-xs">
          <div className="text-muted-foreground">Pot: {pot.toFixed(1)} BB</div>
          <div className="text-muted-foreground">
            Villains: {villains.length}人
          </div>
          <div>
            平均HU勝率:{" "}
            <span className="font-semibold">
              {(avgHeroEq * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <StackView stack={stack} />
          <div
            className={cn(
              "w-20 font-bold text-sm tabular-nums",
              delta > 0 && "text-green-500",
              delta < 0 && "text-red-500",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta} BB
          </div>
        </div>
      </div>

      {action === "bet" && (
        <div className="rounded border bg-muted/40 px-2 py-1 text-xs">
          <span>Bet: {selectedBetSize.toFixed(1)} BB</span>
          <span className="mx-2 text-muted-foreground">|</span>
          <span>必要勝率: {(requiredEquity * 100).toFixed(1)}%</span>
          <span className="mx-2 text-muted-foreground">|</span>
          <span>実現勝率: {(showdownEquity * 100).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

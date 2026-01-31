import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

export const ResultArea = () => {
  const {
    hiddenRequiredEquity,
    heroEquity,
    hero,
    opponentsCount,
    openRaise,
    requiredEquity,
    pot,
    rakeAmount,
    callAmount,
    results,
  } = useActionStore();

  const heroKey = hero.join(" ");
  const opponentEntries = results.flatMap((result) =>
    result.data.filter((r) => r.hand !== heroKey),
  );
  const advantageEquity = 1 / (opponentsCount + 1);
  const equityWinCount =
    opponentEntries.filter((r) => r.equity < advantageEquity).length || 0;

  return (
    <div className="mx-auto w-fit space-y-3 pb-3">
      {results.length > 0 && (
        <div className="grid place-items-center">
          <div className="text-sm">あなたの勝率</div>
          <div
            className={cn(
              "font-bold text-xl",
              heroEquity >= requiredEquity ? "text-green-500" : "text-red-500",
            )}
          >
            {(heroEquity * 100).toFixed(2)}%
          </div>
          <div className="text-muted-foreground text-xs">
            レンジ内の勝率が
            <span className="font-bold text-sm">
              {(advantageEquity * 100).toFixed(0)}
            </span>
            % 超えている割合:{" "}
            {((equityWinCount / (opponentEntries.length || 1)) * 100).toFixed(
              2,
            )}
            %（{equityWinCount}/{opponentEntries.length}）
          </div>
        </div>
      )}
      <div className="text-center text-sm">
        {!hiddenRequiredEquity && (
          <p className="text-muted-foreground">
            必要勝率: {callAmount.toFixed(1)} / ({pot.toFixed(1)} -{" "}
            {rakeAmount.toFixed(2)}) ={" "}
            <span className="align-middle font-bold text-foreground text-lg">
              {(requiredEquity * 100).toFixed(2)}%
            </span>
          </p>
        )}
        <div className="col-span-4 text-muted-foreground text-xs">
          SB: 0.5, BB: 1, BB ANTE: 1,{" "}
          <span className="text-foreground">
            RAISE:{" "}
            <span className="font-bold text-lg">{openRaise.toFixed(1)} </span>
            BB
          </span>
        </div>
      </div>
    </div>
  );
};

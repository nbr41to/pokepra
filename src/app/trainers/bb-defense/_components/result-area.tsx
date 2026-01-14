import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

export const ResultArea = () => {
  const { result, openRaise, requiredEquity, pot, rakeAmount, callAmount } =
    useActionStore();

  const equityWinCount = result?.data.filter((r) => r.equity < 0.5).length || 0;

  return (
    <div className="mx-auto w-fit pb-6 text-sm">
      <div className="grid w-44 grid-cols-2 items-center">
        {result && (
          <>
            <div>
              <div>Pot</div>
              <div className="font-bold text-lg">{pot.toFixed(2)} BB</div>
              <div>Rake</div>
              <div className="font-bold text-lg">
                {rakeAmount.toFixed(2)} BB
              </div>
              <div>勝率</div>
              <div
                className={cn(
                  "font-bold text-lg",
                  result.equity >= requiredEquity
                    ? "text-green-500"
                    : "text-red-500",
                )}
              >
                {(result.equity * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              レンジ内の勝率50%超えている割合:{" "}
              {((equityWinCount / result.data.length) * 100).toFixed(2)}%（
              {equityWinCount}/{result.data.length}）
            </div>
          </>
        )}
        <div>Open Raise</div>
        <div className="font-bold text-lg">{openRaise.toFixed(1)} BB</div>
        <div>必要勝率</div>
        <div className="font-bold text-lg">
          {(requiredEquity * 100).toFixed(2)}%
        </div>
        <div className="col-span-2 whitespace-nowrap text-muted-foreground text-xs">
          計算式: {callAmount.toFixed(2)} / ({pot.toFixed(2)} -{" "}
          {rakeAmount.toFixed(2)}) = {(requiredEquity * 100).toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

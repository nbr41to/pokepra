import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

export const ResultArea = () => {
  const { result, openRaise, requiredEquity, pot, rakeAmount, callAmount } =
    useActionStore();

  const equityWinCount = result?.data.filter((r) => r.equity < 0.5).length || 0;

  return (
    <div className="mx-auto w-fit space-y-3 pb-6">
      {result && (
        <div className="grid place-items-center">
          <div className="text-sm">あなたの勝率</div>
          <div
            className={cn(
              "font-bold text-xl",
              result.equity >= requiredEquity
                ? "text-green-500"
                : "text-red-500",
            )}
          >
            {(result.equity * 100).toFixed(2)}%
          </div>
          <div className="text-xs">
            レンジ内の勝率50%超えている割合:{" "}
            {((equityWinCount / result.data.length) * 100).toFixed(2)}%（
            {equityWinCount}/{result.data.length}）
          </div>
        </div>
      )}
      <div className="text-center text-sm">
        <p className="">
          必要勝率: {callAmount.toFixed(1)} / ({pot.toFixed(1)} -{" "}
          {rakeAmount.toFixed(2)}) ={" "}
          <span className="align-middle font-bold text-lg">
            {(requiredEquity * 100).toFixed(2)}%
          </span>
        </p>
        <div className="col-span-4 text-muted-foreground">
          SB: 0.5, BB: 1, BB ANTE: 1,{" "}
          <span className="font-bold text-foreground">
            RAISE: {openRaise.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

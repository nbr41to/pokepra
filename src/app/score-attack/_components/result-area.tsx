import { ConfirmRangeDrawer } from "@/components/confirm-hand-range/confirm-range-drawer";
import { ConfirmRankingDrawer } from "@/components/confirm-hand-ranking/confirm-ranking-drawer";
import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { cn } from "@/lib/utils";
import { getHandString, judgeInRange } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const ResultArea = () => {
  const { phase, position, hand, board, score, preflop, flop } =
    useActionStore();

  if (hand.length === 0 || !preflop) return <div className="h-12" />;

  const inRange = judgeInRange(hand, position);
  const correct = preflop === "open-raise" ? inRange : !inRange;

  return (
    <div className="relative flex h-12 items-end justify-between pl-12">
      <div>
        {preflop && !flop ? (
          correct ? (
            <ResultGood delta={2} />
          ) : (
            <ResultBad delta={2} />
          )
        ) : (
          <span
            key={score}
            className={cn(
              "inline-block origin-bottom animate-score-bounce font-bold text-xl",
              score > 0 ? "text-green-500" : "text-red-500",
              score === 0 && "hidden",
            )}
          >
            {score > 0 ? "+" : ""}
            {score}pt
          </span>
        )}
      </div>
      <div className="absolute right-0 bottom-0 flex items-center gap-2">
        <ConfirmRankingDrawer
          className={cn(board.length < 3 && "hidden")}
          hand={hand}
          board={board}
        />
        <ConfirmRangeDrawer
          className={cn(
            (flop || (phase === "preflop" && preflop !== "fold")) && "hidden",
          )}
          mark={getHandString(hand)}
        />
      </div>
    </div>
  );
};

import { ConfirmRangeButton } from "@/components/confirm-range-button";
import { ConfirmRankingButton } from "@/components/confirm-ranking-button";
import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { cn } from "@/lib/utils";
import { getHandString, judgeInRange } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const Result = () => {
  const { phase, position, hand, board, score, preflop, flop } =
    useActionStore();

  if (hand.length === 0 || !preflop) return null;

  const inRange = judgeInRange(hand, position);
  const correct = preflop === "open-raise" ? inRange : !inRange;

  return (
    <div className="relative flex justify-center">
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
        <ConfirmRankingButton
          className={cn(board.length < 3 && "hidden")}
          hand={hand}
          board={board}
        />
        <ConfirmRangeButton
          className={cn(
            (flop || (phase === "preflop" && preflop !== "fold")) && "hidden",
          )}
          mark={getHandString(hand)}
        />
      </div>
    </div>
  );
};

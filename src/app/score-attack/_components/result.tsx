import { ConfirmRangeButton } from "@/components/confirm-range-button";
import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { cn } from "@/lib/utils";
import { getHandString, judgeInRange } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const Result = () => {
  const { phase, position, hand, score, preflop, flop } = useActionStore();

  if (hand.length === 0 || !preflop || score === 0) return null;

  const inRange = judgeInRange(hand, position);
  const correct = preflop === "open-raise" ? inRange : !inRange;

  return (
    <div className="relative flex justify-center">
      <div>
        {preflop && !flop ? (
          correct ? (
            <ResultGood delta={score} />
          ) : (
            <ResultBad delta={score} />
          )
        ) : (
          <span
            key={score}
            className={cn(
              "inline-block origin-bottom animate-score-bounce font-bold text-xl",
              score >= 0 ? "text-green-500" : "text-red-500",
            )}
          >
            {score >= 0 ? "+" : ""}
            {score}pt
          </span>
        )}
      </div>
      <ConfirmRangeButton
        className={cn(
          "absolute right-0 bottom-0",
          (flop || (phase === "preflop" && preflop !== "fold")) && "hidden",
        )}
        mark={getHandString(hand)}
      />
    </div>
  );
};

import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { cn } from "@/lib/utils";
import { judgeInRange } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const Result = () => {
  const { phase, position, hand, score, preflop } = useActionStore();

  if (hand.length === 0 || !preflop || score === 0) return null;

  return (
    <div className="flex justify-center">
      <div>
        {phase === "preflop" ? (
          judgeInRange(hand, position) ? (
            <ResultGood delta={score} />
          ) : (
            <ResultBad delta={score} />
          )
        ) : (
          <span
            className={cn(
              "font-bold text-xl",
              score >= 0 ? "text-green-500" : "text-red-500",
            )}
          >
            {score >= 0 ? "+" : ""}
            {score}pt
          </span>
        )}
      </div>
    </div>
  );
};

import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { cn } from "@/lib/utils";
import { judgeInRange } from "@/utils/hand-range";
import { useActionStore } from "./_utils/state";

export const ResultArea = () => {
  const { phase, position, hero, delta, preflop, flop } = useActionStore();

  if (hero.length === 0 || !preflop) return <div className="h-8" />;

  const inRange = judgeInRange(hero, position);
  const correct = preflop === "open-raise" ? inRange : !inRange;

  return (
    <div className="relative flex h-8 items-end justify-center">
      <div>
        {preflop && !flop ? (
          correct ? (
            <ResultGood delta={2} />
          ) : (
            <ResultBad delta={2} />
          )
        ) : (
          <span
            key={phase + delta} // deltaが変わるたびにアニメーションを再実行するためのkey
            className={cn(
              "inline-block origin-top animate-score-bounce font-bold text-2xl",
              delta > 0 ? "text-green-500" : "text-red-500",
              delta === 0 && "hidden",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}pt
          </span>
        )}
      </div>
    </div>
  );
};

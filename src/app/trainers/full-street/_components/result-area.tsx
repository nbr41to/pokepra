import { ResultBad } from "@/components/result-bad";
import { ResultGood } from "@/components/result-good";
import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useHoldemStore } from "./_utils/state";

export const ResultArea = () => {
  const {
    street,
    stack,
    hero,
    delta,
    actions: { preflop, flop },
  } = useHoldemStore();

  if (hero.length === 0 || !preflop) return <div className="h-15" />;

  return (
    <div className="flex h-15 flex-col items-center gap-y-2">
      <div>
        {(street === "preflop" && preflop.action === "fold") ||
        (street !== "preflop" && !flop) ? (
          preflop.correct ? (
            <ResultGood delta={2} />
          ) : (
            <ResultBad delta={-2} />
          )
        ) : (
          <span
            key={street + delta} // deltaが変わるたびにアニメーションを再実行するためのkey
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
      <StackView stack={stack} />
    </div>
  );
};

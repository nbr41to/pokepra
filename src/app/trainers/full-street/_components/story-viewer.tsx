import { HandProbability } from "@/components/hand-probability";
import { cn } from "@/lib/utils";
import { useHoldemStore } from "./_utils/state";

type Props = {
  className?: string;
};
export const StoryViewer = ({ className }: Props) => {
  const { resultHistories } = useHoldemStore();

  return (
    <div className={cn("flex gap-x-2", className)}>
      {resultHistories.map(({ equity, rankOutcome, count }, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={index}
          className={cn("flex w-18 flex-col items-center justify-end")}
        >
          {rankOutcome && count && (
            <div className="-space-y-px">
              {Object.keys(rankOutcome)
                .filter((name) => {
                  const outcome = rankOutcome[name as keyof typeof rankOutcome];
                  return outcome.win + outcome.tie > 0;
                })
                .map((name) => {
                  const outcome = rankOutcome[name as keyof typeof rankOutcome];
                  const total = outcome.win + outcome.tie;
                  const probability = (total / count) * 100;

                  return (
                    <HandProbability
                      key={name}
                      handName={name}
                      probability={probability}
                    />
                  );
                })}
            </div>
          )}
          <div>
            <div className="text-center text-xs">
              {index === 0
                ? "preflop"
                : index === 1
                  ? "flop"
                  : index === 2
                    ? "turn"
                    : "river"}
            </div>
            <div className="text-center font-bold">
              {(equity * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

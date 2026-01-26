import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { AnalyticsSheet } from "@/features/analytics/analytics-sheet";
import { cn } from "@/lib/utils";
import { BET_SIZE_RATES, useActionStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";

export const ActionArea = () => {
  const {
    finished,
    hero,
    board,
    results,
    confirmedHand,
    confirmHand,
    heroAction,
    shuffleAndDeal,
  } = useActionStore();
  const handleOnAction = (action: number | "fold") => {
    heroAction(action);
  };

  return (
    <div className="relative">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          // onDoubleTap={() => handleOnAction(betSize)}
          // doubleTapActionName="Bet"
          onFold={() => handleOnAction("fold")}
          className="bg bg-green-50 dark:bg-green-950/60"
        />
        {confirmedHand && (
          <div className="absolute top-1/2 left-4 flex w-1/2 -translate-y-1/2 flex-wrap gap-2">
            {BET_SIZE_RATES.map((rate) => (
              <Button
                key={rate}
                variant="outline"
                className="relative w-1/3"
                onClick={() => handleOnAction(rate)}
              >
                {Math.round(rate * 100)}%
                <div
                  className={cn(
                    "absolute right-0 -bottom-1 text-muted-foreground text-xs",
                    results[BET_SIZE_RATES.indexOf(rate)] < 0 && "text-red-500",
                  )}
                >
                  {results[BET_SIZE_RATES.indexOf(rate)]?.toFixed(2)}
                </div>
              </Button>
            ))}
          </div>
        )}
        {finished && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/30">
            <Button
              size="lg"
              className="rounded-lg text-base shadow"
              onClick={() => shuffleAndDeal()}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 px-2 py-2">
        <AnalyticsSheet
          hero={hero}
          board={board}
          comparePosition={2} // BB 想定
          disabled={!confirmedHand}
        />
        <InformationSheet />
      </div>
    </div>
  );
};

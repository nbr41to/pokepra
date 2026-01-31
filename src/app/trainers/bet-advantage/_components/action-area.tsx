import { Coins, Percent } from "lucide-react";
import { useState } from "react";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { AnalyticsSheet } from "@/features/analytics/analytics-sheet";
import { RangeAnalyticsSheet } from "@/features/analytics/range-analytics-sheet";
import { cn } from "@/lib/utils";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
} from "@/utils/hand-range";
import { BET_SIZE_RATES, useActionStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";

export const ActionArea = () => {
  const {
    finished,
    position,
    pot,
    hero,
    board,
    continueVillainRange,
    results,
    confirmedHand,
    betActionLabelType,
    confirmHand,
    toggleBetActionLabelType,
    heroAction,
    shuffleAndDeal,
  } = useActionStore();

  const [loading, setLoading] = useState(false);

  const handleOnAction = async (action: number | "fold") => {
    setLoading(true);
    await heroAction(action);
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          doubleTapActionName="Check"
          onDoubleTap={() => handleOnAction(0)}
          onFold={() => handleOnAction("fold")}
          className="bg bg-green-50 dark:bg-green-950/60"
        />
        {confirmedHand && (
          <div className="absolute top-1/2 left-4 w-1/2 -translate-y-1/2 space-y-1">
            <div className="text-muted-foreground text-xs">
              {betActionLabelType === "size"
                ? "ベットサイズ（POT比率）"
                : "相手に要求する必要勝率"}
            </div>
            <div className="flex flex-wrap gap-1">
              {BET_SIZE_RATES.slice(1).map((rate) => {
                const betSize = Math.round(rate * 100);
                const label =
                  betActionLabelType === "size"
                    ? `${betSize}%`
                    : `${((betSize * 100) / (pot + betSize * 2)).toFixed(1)}%`;

                return (
                  <Button
                    key={rate}
                    variant="outline"
                    className="relative w-1/3"
                    onClick={() => handleOnAction(rate)}
                  >
                    {label}
                    <div
                      className={cn(
                        "absolute right-0 -bottom-1 text-muted-foreground text-xs",
                        results[BET_SIZE_RATES.indexOf(rate)] < 0 &&
                          "text-red-500",
                      )}
                    >
                      {results[BET_SIZE_RATES.indexOf(rate)]?.toFixed(2)}
                    </div>
                  </Button>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-full -translate-x-full text-muted-foreground text-xs">
              {results[0]?.toFixed(2)}
            </div>
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
        {loading && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/30">
            <Spinner className="size-16 text-blue-500" />
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
        <RangeAnalyticsSheet
          hero={hero}
          heroRange={getHandsByStrength(getRangeStrengthByPosition(position), [
            ...hero,
            ...board,
          ])}
          board={board}
          compareRange={continueVillainRange}
          disabled={!confirmedHand}
        />
        <Button
          data-state={betActionLabelType}
          className="group rounded-full"
          size="icon-lg"
          variant="outline"
          onClick={toggleBetActionLabelType}
        >
          <Coins className='group-data-[state="size"]:block group-data-[state="equity"]:hidden' />
          <Percent className='group-data-[state="equity"]:block group-data-[state="size"]:hidden' />
        </Button>
        <InformationSheet />
      </div>
    </div>
  );
};

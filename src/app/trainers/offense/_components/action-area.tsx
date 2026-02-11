import { Coins, Percent } from "lucide-react";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { BET_SIZE_RATES, useOffenseStore } from "./_utils/state";

export const ActionArea = () => {
  const {
    hero,
    finished,
    confirmedHand,
    processing,
    pot,
    betActionLabelType,
    confirmHand,
    toggleBetActionLabelType,
    heroCheck,
    heroFold,
    heroBet,
    shuffleAndDeal,
  } = useOffenseStore();

  const runAsyncAction = async (action: () => Promise<void> | void) => {
    if (processing || finished) return;
    await action();
  };

  const handleNext = async () => {
    await shuffleAndDeal();
  };

  return (
    <div className="relative">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          doubleTapActionName="Check"
          onDoubleTap={() => void runAsyncAction(heroCheck)}
          onFold={() => heroFold()}
          disabled={finished || processing}
          className="bg-green-50 dark:bg-green-950/60"
        />

        {confirmedHand && !finished && (
          <div className="absolute top-1/2 left-4 w-1/2 -translate-y-1/2 space-y-1">
            <div className="text-muted-foreground text-xs">
              {betActionLabelType === "size"
                ? "ベットサイズ（POT比率）"
                : "相手に要求する必要勝率"}
            </div>
            <div className="flex flex-wrap gap-1">
              {BET_SIZE_RATES.map((rate) => {
                const betPct = Math.round(rate * 100);
                const label =
                  betActionLabelType === "size"
                    ? `${betPct}%`
                    : `${((rate / (1 + rate * 2)) * 100).toFixed(1)}%`;

                return (
                  <Button
                    key={rate}
                    variant="outline"
                    className="w-[31%] px-0"
                    onClick={() => void runAsyncAction(() => heroBet(rate))}
                    disabled={processing}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Pot: {pot.toFixed(1)} BB
            </div>
          </div>
        )}

        {finished && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/30">
            <Button
              size="lg"
              className="rounded-lg text-base shadow"
              onClick={() => void handleNext()}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 px-2 py-2">
        <Button
          data-state={betActionLabelType}
          className="group rounded-full"
          size="icon-lg"
          variant="outline"
          onClick={toggleBetActionLabelType}
          disabled={finished || processing}
        >
          <Coins className='group-data-[state="size"]:block group-data-[state="equity"]:hidden' />
          <Percent className='group-data-[state="equity"]:block group-data-[state="size"]:hidden' />
        </Button>

        <Button
          variant="outline"
          className="rounded-full px-4"
          onClick={() => void runAsyncAction(heroCheck)}
          disabled={finished || processing}
        >
          Check
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-4"
          onClick={heroFold}
          disabled={finished || processing}
        >
          Fold
        </Button>
      </div>

      {!finished && (
        <div className="px-2 pb-2">
          {!confirmedHand && (
            <p className="text-center text-[11px] text-muted-foreground">
              カードをオープンすると BET ボタンが表示されます
            </p>
          )}
        </div>
      )}
    </div>
  );
};

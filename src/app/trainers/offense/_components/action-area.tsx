import { Coins, Percent } from "lucide-react";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { BET_SIZE_RATES, useOffenseStore } from "./_utils/state";

export const ActionArea = () => {
  const {
    hero,
    street,
    finished,
    confirmedHand,
    processing,
    pot,
    villains,
    resultText,
    heroWinner,
    winnerVillainIds,
    betActionLabelType,
    confirmHand,
    toggleBetActionLabelType,
    heroCheck,
    heroFold,
    heroBet,
    shuffleAndDeal,
  } = useOffenseStore();
  const activeVillainsCount = villains.filter(
    (villain) => villain.active,
  ).length;
  const winnerText = heroWinner
    ? winnerVillainIds.length > 0
      ? "Winner: HERO & VILLAIN (Split)"
      : "Winner: HERO"
    : winnerVillainIds.length > 0
      ? `Winner: VILLAIN ${winnerVillainIds.join(", ")}`
      : "";

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
              {street.toUpperCase()} / 残り {activeVillainsCount} 人
            </div>
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
                    className="relative w-1/3"
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
            <div className="mb-2 rounded bg-background/90 px-3 py-1 text-muted-foreground text-xs shadow-sm">
              {resultText}
            </div>
            {winnerText && (
              <div className="mb-2 rounded bg-yellow-100 px-3 py-1 font-semibold text-xs text-yellow-800 shadow-sm dark:bg-yellow-900/70 dark:text-yellow-100">
                {winnerText}
              </div>
            )}
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
      </div>
    </div>
  );
};

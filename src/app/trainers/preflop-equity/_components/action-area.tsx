import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { toHandSymbol } from "@/utils/hand-range";
import { useActionStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";
import { RetrySheet } from "./retry-sheet";

export const ActionArea = () => {
  const { hero, confirmHand, preflop, result, preflopAction, shuffleAndDeal } =
    useActionStore();

  return (
    <div className="">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={() => preflopAction("open-raise")}
          doubleTapActionName="Open"
          onFold={() => preflopAction("fold")}
          disabled={!!preflop}
          className="bg bg-green-50 dark:bg-green-950/60"
        />

        {!!preflop && (
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

      <div className="flex justify-end gap-4 p-2">
        <RetrySheet hero={hero} result={result} disabled={!preflop} />
        <HandRangeDrawer mark={toHandSymbol(hero)} />
        <InformationSheet />
      </div>
    </div>
  );
};

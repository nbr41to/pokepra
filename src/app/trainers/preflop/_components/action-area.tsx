import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { useActionStore } from "./_utils/state";

export const ActionArea = () => {
  const { hero, showHand, preflop, preflopAction, shuffleAndDeal } =
    useActionStore();

  return (
    <div className="pt-8">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={showHand}
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
    </div>
  );
};

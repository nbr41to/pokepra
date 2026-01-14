import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { useActionStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";

export const ActionArea = () => {
  const { hero, showHand, action, calcResult, shuffleAndDeal } =
    useActionStore();

  return (
    <div className="pt-8">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={showHand}
          onDoubleTap={() => calcResult("call")}
          doubleTapActionName="Call"
          onFold={() => calcResult("fold")}
          disabled={!!action}
          className="bg bg-green-50 dark:bg-green-950/60"
        />

        {!!action && (
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

      <div className="flex justify-center gap-4 px-2 py-2">
        <InformationSheet />
      </div>
    </div>
  );
};

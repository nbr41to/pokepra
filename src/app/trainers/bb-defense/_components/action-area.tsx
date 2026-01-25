import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { useActionStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";

export const ActionArea = () => {
  const { hero, confirmHand, action, calcResult, shuffleAndDeal } =
    useActionStore();

  return (
    <div className="pt-3">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
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

      <div className="flex justify-end gap-4 p-2">
        <InformationSheet />
      </div>
    </div>
  );
};

import { LockIcon, LockOpen } from "lucide-react";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { useTrainerStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";

export const ActionArea = () => {
  const {
    settings: { lockedPosition },
    finished,
    hero,
    confirmHand,
    shuffleAndDeal,
    open,
    fold,
    toggleLockPosition,
  } = useTrainerStore();

  return (
    <div className="">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={open}
          doubleTapActionName="Open"
          onFold={fold}
          disabled={finished}
          className="bg bg-green-50 dark:bg-green-950/60"
        />

        {finished && (
          <div className="absolute top-0 left-0 h-full w-full bg-background/30">
            <Button
              size="lg"
              className="absolute bottom-8 left-12 rounded-lg text-base shadow"
              onClick={() => shuffleAndDeal()}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-x-4 p-2">
        <Button
          className="rounded-full"
          size="icon-lg"
          onClick={toggleLockPosition}
        >
          {lockedPosition ? <LockIcon /> : <LockOpen />}
        </Button>
        <InformationSheet />
      </div>
    </div>
  );
};

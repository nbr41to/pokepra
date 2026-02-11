import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { useFullStreetDefenseStore } from "./_utils/state";

export const ActionArea = () => {
  const {
    finished,
    hero,
    equityHidden,
    confirmHand,
    toggleEquityHidden,
    heroAction,
    shuffleAndDeal,
  } = useFullStreetDefenseStore();
  const [loading, setLoading] = useState(false);

  const handleAction = async (nextAction: "call" | "fold") => {
    if (finished || loading) return;
    setLoading(true);
    await heroAction(nextAction);
    setLoading(false);
  };

  const handleNext = async () => {
    setLoading(true);
    await shuffleAndDeal();
    setLoading(false);
  };

  return (
    <div className="pt-2">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={() => handleAction("call")}
          doubleTapActionName="Call"
          onFold={() => handleAction("fold")}
          disabled={finished || loading}
          className="bg bg-green-50 dark:bg-green-950/60"
        />

        {finished && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/30">
            <Button
              size="lg"
              className="rounded-lg text-base shadow"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        )}

        {loading && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/20">
            <Spinner className="size-12 text-blue-500 opacity-50" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 p-2">
        <Button
          data-state={equityHidden ? "closed" : "open"}
          className="group rounded-full"
          size="icon-lg"
          variant="outline"
          onClick={toggleEquityHidden}
        >
          <Eye className='group-data-[state="open"]:block group-data-[state="closed"]:hidden' />
          <EyeClosed className='group-data-[state="closed"]:block group-data-[state="open"]:hidden' />
        </Button>
      </div>
    </div>
  );
};

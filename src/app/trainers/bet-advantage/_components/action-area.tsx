import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { AnalyticsSheet } from "@/features/analytics/analytics-sheet";
import { useActionStore } from "./_utils/state";
import { BetSlider } from "./bet-slider";

export const ActionArea = () => {
  const {
    finished,
    hero,
    board,
    confirmedHand,
    confirmHand,
    equityHidden,
    toggleEquityHidden,
    heroAction,
    shuffleAndDeal,
  } = useActionStore();
  const [betSize, setBetSize] = useState(10);
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
          onDoubleTap={() => handleOnAction(betSize)}
          doubleTapActionName="Bet"
          onFold={() => handleOnAction("fold")}
          className="bg bg-green-50 dark:bg-green-950/60"
        />
        {confirmedHand && (
          <div className="absolute bottom-0 left-4">
            <BetSlider step={5} value={betSize} onChange={setBetSize} />
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

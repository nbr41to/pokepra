import { Eye, EyeClosed } from "lucide-react";
import { AnalyticsSheet2 } from "@/components/analytics-sheet-2";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { toHandSymbol } from "@/utils/hand-range";
import { useActionStore } from "./_utils/state";

export const ActionArea = () => {
  const {
    finished,
    hero,
    board,
    villainPosition,
    confirmedHand,
    confirmHand,
    equityHidden,
    toggleEquityHidden,
    heroAction,
    shuffleAndDeal,
  } = useActionStore();

  const handleOnAction = (action: "call" | "fold") => {
    heroAction(action);
  };

  return (
    <div className="relative">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={() => handleOnAction("call")}
          doubleTapActionName="Call"
          onFold={() => handleOnAction("fold")}
          className="bg bg-green-50 dark:bg-green-950/60"
        />

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
        <HandRangeDrawer mark={toHandSymbol(hero)} />
        <AnalyticsSheet2
          hero={hero}
          board={board}
          comparePosition={villainPosition}
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

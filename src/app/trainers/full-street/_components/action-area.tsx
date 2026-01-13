import { useState } from "react";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { simulateVsListWithRanks } from "@/lib/wasm/simulate-vs-list-with-ranks";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { useHoldemStore } from "./_utils/state";
import { SituationCopyButton } from "./situation-copy-button";

export const ActionArea = () => {
  const {
    gameId,
    finished,
    street,
    hero,
    board,
    actions,
    confirmHand,
    preflopAction,
    postflopAction,
    shuffleAndDeal,
  } = useHoldemStore();

  const [loading, setLoading] = useState(false);

  const handleOnFold = async () => {
    if (street === "preflop") {
      preflopAction("fold");
    } else {
      setLoading(true);
      await postflopAction({ street, bet: "fold" });
      setLoading(false);
    }
  };

  const handleOnDoubleTap = async () => {
    if (street === "preflop") {
      preflopAction("open-raise");
    } else {
      setLoading(true);
      await postflopAction({ street, bet: 50 });
      setLoading(false);
    }
  };

  const resultPromise = simulateVsListWithRanks({
    hero,
    board,
    compare: getHandsInRange(getRangeStrengthByPosition(9), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  return (
    <div className="">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-") + gameId} // ハンドごとにレンダリングするように
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={handleOnDoubleTap}
          onFold={handleOnFold}
          disabled={finished || loading}
        />
        {finished && (
          <div className="absolute top-0 left-0 z-10 grid h-full w-full place-content-center bg-background/30">
            <Button
              size="lg"
              className="rounded-lg text-base shadow"
              onClick={() => shuffleAndDeal()}
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

      <div className="flex justify-center gap-4 p-2">
        <HandRangeDrawer
          mark={toHandSymbol(hero)}
          disabled={!actions.preflop}
        />
        <AnalyticsSheet
          board={board}
          rankPromise={resultPromise}
          disabled={street === "preflop" || board.length < 3}
        />
        <SituationCopyButton hero={hero} board={board} />
      </div>
    </div>
  );
};

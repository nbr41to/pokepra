import { useState } from "react";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  simulateVsListEquity,
  simulateVsListWithRanks,
} from "@/lib/wasm/simulation";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { useActionStore } from "./_utils/state";

export const ActionArea = () => {
  const {
    phase,
    position,
    hero,
    board,
    preflop,
    flop,
    turn,
    river,
    showHand,
    preflopAction,
    postflopAction,
    shuffleAndDeal,
  } = useActionStore();

  const [loading, setLoading] = useState(false);
  const handleOnPostflopAction = async (answer: "commit" | "fold") => {
    setLoading(true);
    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: getHandsInRange(getRangeStrengthByPosition(position), [
        ...hero,
        ...board,
      ]),
      trials: 1000,
    });
    postflopAction(phase, answer, result);
    setLoading(false);
  };
  const handleOnDoubleTapAction = async () => {
    if (phase === "preflop") {
      preflopAction("open-raise");
    } else {
      handleOnPostflopAction("commit");
    }
  };

  const handleFoldAction = () => {
    if (phase === "preflop") {
      preflopAction("fold");
    } else {
      handleOnPostflopAction("fold");
    }
  };

  const rankPromise = simulateVsListWithRanks({
    hero,
    board,
    compare: getHandsInRange(getRangeStrengthByPosition(9), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  const disabled =
    (phase === "preflop" && preflop === "fold") ||
    (phase === "flop" && !!flop) ||
    (phase === "turn" && !!turn) ||
    (phase === "river" && !!river);
  const disabledAnalysis = board.length < 3;

  return (
    <div className="pt-14">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={showHand}
          onFold={handleFoldAction}
          onDoubleTap={handleOnDoubleTapAction}
          disabled={disabled || loading}
        />

        {loading && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/20">
            <Spinner className="size-12 text-blue-500 opacity-50" />
          </div>
        )}

        {disabled && (
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
        <HandRangeDrawer mark={toHandSymbol(hero)} disabled={!preflop} />
        <AnalyticsSheet
          board={board}
          rankPromise={rankPromise}
          disabled={disabledAnalysis}
        />
      </div>
    </div>
  );
};

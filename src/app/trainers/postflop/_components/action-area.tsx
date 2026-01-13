import { useState } from "react";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  simulateVsListEquity,
  simulateVsListWithRanks,
} from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "./_utils/state";
import { BetSlider } from "./bet-slider";
import { SituationCopyButton } from "./situation-copy-button";

export const ActionArea = () => {
  const {
    phase,
    position,
    hero,
    board,
    showedHand,
    showHand,
    flop,
    turn,
    river,
    postflopAction,
    shuffleAndDeal,
  } = useActionStore();

  const [bet, setBet] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleOnAction = async (action: "commit" | "fold") => {
    setLoading(true);
    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: getHandsByTiers(getTierIndexByPosition(position), [
        ...hero,
        ...board,
      ]),
      trials: 1000,
    });
    postflopAction(
      phase,
      action,
      result,
      action === "commit" ? bet : undefined,
    );
    if (phase === "river") {
      setBet(0);
    }
    setLoading(false);
  };

  const rankPromise = simulateVsListWithRanks({
    hero,
    board,
    compare: getHandsByTiers(getTierIndexByPosition(9), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  const disabled =
    (phase === "flop" && !!flop) ||
    (phase === "turn" && !!turn) ||
    (phase === "river" && !!river);

  const disabledAnalysis = board.length < 3;

  return (
    <div className="relative">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={showHand}
          onDoubleTap={() => handleOnAction("commit")}
          onFold={() => handleOnAction("fold")}
          disabled={disabled || loading}
          doubleTapActionName="Commit"
          className="bg bg-green-50 dark:bg-green-950/60"
        />

        {showedHand && !disabled && (
          <BetSlider
            className="absolute bottom-0 left-0"
            step={5}
            value={bet}
            onChange={setBet}
          />
        )}

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
        <AnalyticsSheet
          board={board}
          rankPromise={rankPromise}
          disabled={disabledAnalysis}
        />
        <SituationCopyButton board={board} />
      </div>
    </div>
  );
};

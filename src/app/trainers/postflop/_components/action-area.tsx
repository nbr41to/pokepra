import { useState } from "react";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { SituationCopyButton } from "@/components/situation-copy-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  simulateVsListEquity,
  simulateVsListWithRanks,
} from "@/lib/wasm/simulation";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { useActionStore } from "./_utils/state";
import { BetSlider } from "./bet-slider";

export const ActionArea = () => {
  const {
    street,
    position,
    hero,
    board,
    confirmedHand,
    confirmHand,
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
      compare: getHandsByStrength(getRangeStrengthByPosition(position), [
        ...hero,
        ...board,
      ]),
      trials: 1000,
    });
    postflopAction(
      street,
      action,
      result,
      action === "commit" ? bet : undefined,
    );
    if (street === "river") {
      setBet(0);
    }
    setLoading(false);
  };

  const rankPromise = simulateVsListWithRanks({
    hero,
    board,
    compare: getHandsByStrength(getRangeStrengthByPosition(9), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  const disabled =
    (street === "flop" && !!flop) ||
    (street === "turn" && !!turn) ||
    (street === "river" && !!river);

  const disabledAnalysis = board.length < 3;

  return (
    <div className="relative">
      <div className="relative">
        <HeroActionArea
          key={hero.join("-")}
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={() => handleOnAction("commit")}
          doubleTapActionName="Bet"
          onFold={() => handleOnAction("fold")}
          disabled={disabled || loading}
          className="bg bg-green-50 dark:bg-green-950/60"
        />

        {confirmedHand && !disabled && (
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
        <HandRangeDrawer mark={toHandSymbol(hero)} />
        <AnalyticsSheet
          board={board}
          rankPromise={rankPromise}
          disabled={disabledAnalysis}
        />
        <SituationCopyButton hero={hero} board={board} />
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { BetSlider } from "@/app/trainers/postflop/_components/bet-slider";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { useOpenRaiseVsBbStore } from "./_utils/state";
import { ActionHistoryDrawer } from "./action-history-drawer";
import { SituationCopyButton } from "./situation-copy-button";

export const ActionArea = () => {
  const {
    gameId,
    finished,
    street,
    hero,
    board,
    stack,
    confirmedHand,
    villainOpenAction,
    villainReaction,
    villainBet,
    actionHistory,
    confirmHand,
    fetchVillainOpenAction,
    postflopAction,
    shuffleAndDeal,
  } = useOpenRaiseVsBbStore();

  const [loading, setLoading] = useState(false);
  const [bet, setBet] = useState(0);
  const [villainLoading, setVillainLoading] = useState(false);
  const villainReady = villainOpenAction !== null;
  const actionLocked =
    finished ||
    loading ||
    villainLoading ||
    (confirmedHand && street !== "preflop" && !villainReady);
  const betMin = villainOpenAction === "bet" ? Math.min(villainBet, stack) : 0;
  const betMax = Math.min(100, Math.max(stack, 0));
  const actionLabel = villainOpenAction === "bet" ? "Raise" : "Bet";
  const isBusy = loading || villainLoading;

  const formatAction = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);
  const villainStatus =
    !confirmedHand || street === "preflop"
      ? "Open hand to start"
      : villainOpenAction === "bet"
        ? `BB: Bet ${villainBet}`
        : villainOpenAction === "check"
          ? "BB: Check"
          : villainReaction === "fold"
            ? "BB: Fold"
            : "BB: Thinking...";
  const showResponse = villainOpenAction !== null || finished;
  const villainResponse =
    showResponse && villainReaction
      ? `Response: ${formatAction(villainReaction)}`
      : "";
  const minRaiseLabel =
    villainOpenAction === "bet" ? `Min raise: ${villainBet * 2}BB` : "";
  const minBetLabel =
    confirmedHand && street !== "preflop" && villainOpenAction !== "bet"
      ? "Bet min: 1BB"
      : "";

  useEffect(() => {
    if (!confirmedHand || street === "preflop") return;
    const nextBet =
      villainOpenAction === "bet" ? Math.min(villainBet, stack) : 0;
    setBet(nextBet);
  }, [confirmedHand, street, villainBet, villainOpenAction, stack]);

  const handleOpenHand = async () => {
    confirmHand();
    if (street !== "preflop") return;
    if (villainReady || finished) return;
    setVillainLoading(true);
    await fetchVillainOpenAction();
    setVillainLoading(false);
  };

  const handleOnFold = async () => {
    if (street === "preflop" || villainOpenAction !== "bet") return;
    if (actionLocked) return;
    setLoading(true);
    await postflopAction({ street, bet: "fold" });
    setLoading(false);
  };

  const handleOnDoubleTap = async () => {
    if (street === "preflop") return;
    if (actionLocked) return;
    setLoading(true);
    await postflopAction({ street, bet });
    setLoading(false);
    if (street === "river") return;
    setVillainLoading(true);
    await fetchVillainOpenAction();
    setVillainLoading(false);
  };

  const resultPromise = simulateVsListWithRanks({
    hero,
    board,
    compare: getHandsByStrength(getRangeStrengthByPosition(9), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  return (
    <div className="">
      <div className="flex items-center justify-between px-3 text-muted-foreground text-xs">
        <span>{villainStatus}</span>
        <div className="flex items-center gap-2">
          {minBetLabel && <span>{minBetLabel}</span>}
          {minRaiseLabel && <span>{minRaiseLabel}</span>}
          {villainResponse && <span>{villainResponse}</span>}
        </div>
      </div>
      <div className="relative">
        <HeroActionArea
          key={hero.join("-") + gameId} // ハンドごとにレンダリングするように
          hand={hero}
          onOpenHand={handleOpenHand}
          doubleTapActionName={actionLabel}
          onDoubleTap={handleOnDoubleTap}
          onFold={
            street === "preflop" || villainOpenAction !== "bet"
              ? undefined
              : handleOnFold
          }
          disabled={finished || loading}
        />

        {confirmedHand && street !== "preflop" && !finished && (
          <BetSlider
            className="absolute bottom-0 left-0"
            step={1}
            value={bet}
            onChange={setBet}
            min={betMin}
            max={betMax}
            disabled={actionLocked}
          />
        )}

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

        {isBusy && (
          <div className="absolute top-0 left-0 grid h-full w-full place-content-center bg-background/20">
            <Spinner className="size-12 text-blue-500 opacity-50" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-2">
        <HandRangeDrawer
          mark={toHandSymbol(hero)}
          disabled={street === "preflop"}
        />
        <ActionHistoryDrawer
          items={actionHistory}
          disabled={actionHistory.length === 0}
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

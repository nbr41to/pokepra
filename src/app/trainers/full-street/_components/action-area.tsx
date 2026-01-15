import { useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { HeroActionArea } from "@/components/hero-action-area";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { simulateVsListWithRanks } from "@/lib/wasm/simulate-vs-list-with-ranks";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import {
  getHandsInRange,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { SituationCopyButton } from "../../../../components/situation-copy-button";
import { useHoldemStore } from "./_utils/state";

export const ActionArea = () => {
  const {
    gameId,
    finished,
    street,
    hero,
    board,
    confirmHand,
    preflopAction,
    postflopAction,
    shuffleAndDeal,
  } = useHoldemStore();

  const [loading, setLoading] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [rankPromise, setRankPromise] =
    useState<Promise<CombinedPayload> | null>(null);
  const rankPromiseCache = useRef(new Map<string, Promise<CombinedPayload>>());

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

  const compareHands = useMemo(
    () => getHandsInRange(getRangeStrengthByPosition(9), [...hero, ...board]),
    [hero, board],
  );

  useEffect(() => {
    if (!analyticsOpen) return;
    const cacheKey = `${hero.join("-")}|${board.join("-")}`;
    const cached = rankPromiseCache.current.get(cacheKey);
    if (cached) {
      setRankPromise(cached);
      return;
    }
    const nextPromise = simulateVsListWithRanks({
      hero,
      board,
      compare: compareHands,
      trials: 1000,
    });
    rankPromiseCache.current.set(cacheKey, nextPromise);
    setRankPromise(nextPromise);
  }, [analyticsOpen, hero, board, compareHands]);

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
        <HandRangeDrawer mark={toHandSymbol(hero)} />
        <AnalyticsSheet
          board={board}
          rankPromise={rankPromise}
          disabled={street === "preflop" || board.length < 3}
          onOpenChange={setAnalyticsOpen}
        />
        <SituationCopyButton hero={hero} board={board} />
      </div>
    </div>
  );
};

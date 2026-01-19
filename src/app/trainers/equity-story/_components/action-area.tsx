import { RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsSheet } from "@/components/analytics-sheet";
import { Combo } from "@/components/combo";
import { HandRangeDrawer } from "@/components/hand-range-drawer/hand-range-drawer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import {
  getHandsByStrength,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { SituationCopyButton } from "../../../../components/situation-copy-button";
import { useHoldemStore } from "./_utils/state";
import { InformationSheet } from "./information-sheet";

export const ActionArea = () => {
  const {
    street,
    hero,
    board,
    preflopAction,
    postflopAction,
    rewindStreet,
    shuffleAndDeal,
  } = useHoldemStore();

  const [loading, setLoading] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [rankPromise, setRankPromise] =
    useState<Promise<CombinedPayload> | null>(null);
  const rankPromiseCache = useRef(new Map<string, Promise<CombinedPayload>>());

  const handleNextStreet = async () => {
    if (street === "preflop") {
      preflopAction("open-raise");
      return;
    }
    if (street === "flop" || street === "turn") {
      setLoading(true);
      await postflopAction({ street, bet: 50 });
      setLoading(false);
    }
  };

  const compareHands = useMemo(
    () =>
      getHandsByStrength(getRangeStrengthByPosition(9), [...hero, ...board]),
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
        {/* <HeroActionArea
          key={hero.join("-") + gameId} // ハンドごとにレンダリングするように
          hand={hero}
          onOpenHand={confirmHand}
          onDoubleTap={handleOnDoubleTap}
          onFold={handleOnFold}
          disabled={finished || loading}
        /> */}
        <div className="flex w-full items-center justify-between gap-x-4 px-5">
          <div className="flex items-center gap-2">
            <Combo hand={hero} className="mr-4 scale-120" />
            <Button
              size="lg"
              variant="outline"
              onClick={rewindStreet}
              disabled={street === "preflop" || street === "flop" || loading}
            >
              Prev
            </Button>
            <Button
              size="lg"
              onClick={handleNextStreet}
              disabled={street === "river" || loading}
            >
              Next
            </Button>
          </div>
          <Button
            size="icon"
            className="rounded-full"
            variant="outline"
            onClick={() => shuffleAndDeal()}
          >
            <RefreshCcw />
          </Button>
        </div>

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
        <InformationSheet />
      </div>
    </div>
  );
};

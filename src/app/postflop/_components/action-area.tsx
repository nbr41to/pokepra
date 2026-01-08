import { Suspense } from "react";
import { ConfirmEquityDrawer } from "@/components/confirm-equity";
import { ConfirmRankingSheet } from "@/components/confirm-hand-ranking";
import { HandConfirmation } from "@/components/hand-confirmation";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";
import { ActionAreaSkeleton } from "./action-area.skeleton";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const { position, hero, board, showedHand, showHand } = useActionStore();

  const rankPromise = simulateVsListWithRanks({
    hero,
    board,
    compare: getHandsByTiers(getTierIndexByPosition(position), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  return (
    <div className="relative w-full pt-14">
      <HandConfirmation hands={hero} onOpenHand={showHand} disabledFold />

      {showedHand && board.length > 2 && (
        <div className="absolute top-0 left-0 z-10 flex h-76 flex-col space-y-2">
          <Suspense fallback={<ActionAreaSkeleton />}>
            <div className="flex h-12 gap-4 px-2">
              <ConfirmRankingSheet board={board} rankPromise={rankPromise} />
              <ConfirmEquityDrawer board={board} rankPromise={rankPromise} />
            </div>
            <SelectAction rankPromise={rankPromise} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

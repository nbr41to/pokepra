import { ConfirmEquityDrawer } from "@/components/confirm-equity";
import { ConfirmRankingSheet } from "@/components/confirm-hand-ranking";
import { HandConfirmation } from "@/components/hand-confirmation";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "./_utils/state";
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

  const disabledAnalysis = board.length < 3;

  return (
    <div className="relative w-full">
      <HandConfirmation hands={hero} onOpenHand={showHand} disabledFold />

      {showedHand && board.length > 2 && (
        <div className="absolute top-0 left-0 z-10 flex flex-col space-y-2">
          <SelectAction />
        </div>
      )}
      <div className="flex justify-center gap-4 px-2 py-2">
        <ConfirmRankingSheet
          board={board}
          rankPromise={rankPromise}
          disabled={disabledAnalysis}
        />
        <ConfirmEquityDrawer
          board={board}
          rankPromise={rankPromise}
          disabled={disabledAnalysis}
        />
      </div>
    </div>
  );
};

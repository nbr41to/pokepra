import { ConfirmEquityDrawer } from "@/components/confirm-equity/confirm-equity-drawer";
import { ConfirmRankingSheet } from "@/components/confirm-hand-ranking";
import { HandConfirmation } from "@/components/hand-confirmation";
import { cn } from "@/lib/utils";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const {
    phase,
    position,
    hero,
    board,
    flop,
    river,
    showedHand,
    showHand,
    postflopAction,
  } = useActionStore();

  const handleOnPostflopAction = async (answer: "commit" | "fold") => {
    const result = await rankPromise;
    postflopAction(phase, answer, result);
  };

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
    <div className="relative w-full">
      <div className="relative z-10 flex h-8 gap-4 px-2">
        <ConfirmRankingSheet
          className={cn(board.length < 3 && "hidden")}
          board={board}
          rankPromise={rankPromise}
        />
        <ConfirmEquityDrawer board={board} rankPromise={rankPromise} />
      </div>

      <div className="relative pt-6">
        <HandConfirmation hands={hero} onOpenHand={showHand} disabledFold />
        {showedHand && (
          <div className="absolute top-0 left-0 h-full w-1/2 pt-6">
            <SelectAction onAction={handleOnPostflopAction} />
          </div>
        )}
      </div>
    </div>
  );
};

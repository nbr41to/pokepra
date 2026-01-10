import { ConfirmRangeDrawer } from "@/components/confirm-hand-range/confirm-range-drawer";
import { ConfirmRankingSheet } from "@/components/confirm-hand-ranking";
import { HandConfirmation } from "@/components/hand-confirmation";
import { cn } from "@/lib/utils";
import { simulateVsListEquity, simulateVsListWithRanks } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getHandString, getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "./_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const {
    phase,
    position,
    hero,
    board,
    preflop,
    flop,
    river,
    showedHand,
    showHand,
    preflopAction,
    postflopAction,
  } = useActionStore();

  const handleOnPostflopAction = async (answer: "commit" | "fold") => {
    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: getHandsByTiers(getTierIndexByPosition(position), [
        ...hero,
        ...board,
      ]),
      trials: 1000,
    });
    postflopAction(phase, answer, result);
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
    compare: getHandsByTiers(getTierIndexByPosition(position), [
      ...hero,
      ...board,
    ]),
    trials: 1000,
  });

  return (
    <div className="relative w-full pt-14">
      <HandConfirmation
        hands={hero}
        onOpenHand={showHand}
        onFold={handleFoldAction}
        disabledFold={!!river}
      />

      {showedHand && (
        <div className="absolute top-0 left-0 z-10 flex h-76 flex-col space-y-2">
          <div className="flex h-12 gap-4 px-2">
            <ConfirmRankingSheet
              className={cn(board.length < 3 && "hidden")}
              board={board}
              rankPromise={rankPromise}
            />
            <ConfirmRangeDrawer
              className={cn(
                (flop || (phase === "preflop" && preflop !== "fold")) &&
                  "hidden",
              )}
              mark={getHandString(hero)}
            />
          </div>
          <div className="grow">
            {showedHand && <SelectAction onAction={handleOnPostflopAction} />}
          </div>
        </div>
      )}
    </div>
  );
};

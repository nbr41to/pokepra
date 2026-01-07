"use client";

import { StackView } from "@/components/stack-view";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";
import { ActionArea } from "./action-area";
import { CommunityBoard } from "./community-board";
import { ConfirmPosition } from "./confirm-position";
import { ResultArea } from "./result-area";

export default function Main() {
  const { stack, hand, board, position } = useActionStore();

  const rankPromise = simulateVsListWithRanks({
    hero: hand.join(" "),
    board: board.join(" "),
    compare: getHandsByTiers(getTierIndexByPosition(position), [
      ...hand,
      ...board,
    ])
      .join("; ")
      .replaceAll(",", " "),
    trials: 1000,
  });

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-end gap-y-8 p-2 pb-8">
      <CommunityBoard />
      <div className="flex flex-col items-end space-y-1">
        <ConfirmPosition />
        <StackView stack={stack} />
      </div>
      <div className="w-full space-y-2">
        <ResultArea rankPromise={rankPromise} />
        <ActionArea rankPromise={rankPromise} />
      </div>
    </div>
  );
}

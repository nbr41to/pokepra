"use client";

import { useEffect } from "react";
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
  const { stack, hero, board, position, reset } = useActionStore();

  const rankPromise = simulateVsListWithRanks({
    hero: hero.join(" "),
    board: board.join(" "),
    compare: getHandsByTiers(getTierIndexByPosition(position), [
      ...hero,
      ...board,
    ])
      .join("; ")
      .replaceAll(",", " "),
    trials: 1000,
  });

  useEffect(() => {
    return reset;
  }, [reset]);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-end gap-y-2 p-2 pb-8">
      <CommunityBoard />
      <ConfirmPosition />
      <div className="flex w-full justify-between space-y-1 px-2">
        <ResultArea />
        <StackView stack={stack} />
      </div>
      <ActionArea rankPromise={rankPromise} />
    </div>
  );
}

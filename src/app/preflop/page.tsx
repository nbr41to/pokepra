"use client";

import { useState } from "react";
import { genBoard, genHands } from "@/utils/dealer";
import { Board } from "./_components/board";
import { HandConfirmation } from "./_components/hand-confirmation";
import { Position } from "./_components/position";
import { SelectAction } from "./_components/select-action";

export default function Page() {
  const hands = genHands(8);
  const board = genBoard(3, hands);

  const [handConfirmed, setHandConfirmed] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between gap-y-8 p-2">
      <Position total={6} playerPosition={3} />
      <div className="space-y-5">
        <div className="h-22">{handConfirmed && <Board cards={board} />}</div>
        <HandConfirmation
          hands={hands}
          onOpenHand={() => setHandConfirmed(true)}
        />
      </div>
      <SelectAction phase="options" />
    </div>
  );
}

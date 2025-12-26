"use client";

import { useEffect } from "react";
import { genHands } from "@/utils/dealer";
import { ActionArea } from "./_components/action-area";
import { Board } from "./_components/board";
import { Position } from "./_components/position";
import { Result } from "./_components/result";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { position, board, setPosition, setHands } = useActionStore();

  useEffect(() => {
    const newHands = genHands();
    setPosition();
    setHands(newHands);
  }, [setPosition, setHands]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between gap-y-8 p-2">
      <Position total={9} playerPosition={position} />

      {board.length > 2 && <Board />}

      <div className="space-y-2">
        <Result />
        <ActionArea />
      </div>
    </div>
  );
}

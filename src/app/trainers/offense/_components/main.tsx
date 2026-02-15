"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/board";
import { OtherHand } from "@/components/other-hand";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";
import { useOffenseStore } from "./_utils/state";
import { ActionArea } from "./action-area";

export function Main() {
  const {
    initialized,
    processing,
    villains,
    finished,
    board,
    street,
    winnerVillainIds,
    shuffleAndDeal,
    reset,
  } = useOffenseStore();
  const showWinner = finished && street === "river";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await shuffleAndDeal();
      setLoading(false);
    })();

    return reset;
  }, [shuffleAndDeal, reset]);

  if (!initialized || loading) {
    return (
      <div className="grid w-full place-content-center py-20">
        <Spinner className="size-10 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative mt-auto w-full space-y-3">
      <div className="space-y-2 px-2">
        <div className="text-center text-muted-foreground text-xs uppercase tracking-wide">
          {street} street
        </div>
        <div className="grid place-content-center">
          <Board cards={board} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 px-2">
        {villains.map((villain) => (
          <div
            key={villain.id}
            className={cn(
              "flex flex-col items-center gap-1 transition-opacity",
              !villain.active && "opacity-30",
              showWinner &&
                winnerVillainIds.includes(villain.id) &&
                "rounded border border-yellow-400/70 bg-yellow-50/60 px-1 py-1 dark:bg-yellow-950/20",
            )}
          >
            {showWinner && winnerVillainIds.includes(villain.id) && (
              <span className="rounded bg-yellow-100 px-2 py-0.5 font-bold text-[10px] text-yellow-700 tracking-wide dark:bg-yellow-900/70 dark:text-yellow-200">
                WINNER
              </span>
            )}
            {villain.reaction && (
              <span
                className={cn(
                  "rounded px-2 py-0.5 font-semibold text-[11px] tracking-wide",
                  villain.reaction === "call"
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                )}
              >
                {villain.reaction.toUpperCase()}
              </span>
            )}
            <OtherHand hand={villain.hand} reversed={finished} />
          </div>
        ))}
      </div>
      <ActionArea />
      {processing && (
        <div className="absolute inset-0 z-20 grid place-content-center bg-background/40 backdrop-blur-[1px]">
          <Spinner className="size-12 text-blue-500" />
        </div>
      )}
    </div>
  );
}

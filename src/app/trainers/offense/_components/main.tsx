"use client";

import { useEffect, useState } from "react";
import { OtherHand } from "@/components/other-hand";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";
import { useOffenseStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { GameInfo } from "./game-info";
import { ResultArea } from "./result-area";

export function Main() {
  const { initialized, processing, villains, finished, shuffleAndDeal, reset } =
    useOffenseStore();
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
    <div className="relative mt-auto w-full space-y-2">
      <GameInfo />
      <ResultArea />
      <div className="flex flex-wrap items-center justify-center gap-2 px-2">
        {villains.map((villain) => (
          <div
            key={villain.id}
            className={cn(
              "flex min-w-24 flex-col items-center gap-1 rounded border bg-card/60 px-2 py-2 transition-opacity",
              finished && villain.decision === "fold" && "opacity-30",
            )}
          >
            <span className="text-muted-foreground text-xs">
              Villain {villain.id}
            </span>
            <OtherHand hand={villain.hand} reversed={finished} />
            {finished && villain.decision && (
              <span
                className={cn(
                  "rounded px-2 py-0.5 font-semibold text-[11px] tracking-wide",
                  villain.decision === "call"
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                )}
              >
                {villain.decision.toUpperCase()}
              </span>
            )}
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

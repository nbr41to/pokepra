"use client";

import { useEffect, useState } from "react";
import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useFullStreetDefenseStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityBoard } from "./community-board";
import { ConfirmPosition } from "./confirm-position";
import { CurrentBetting } from "./current-betting";
import { FailureOverlay } from "./failure-overlay";
import { ResultArea } from "./result-area";

export function Main() {
  const { initialized, stack, delta, shuffleAndDeal, reset, retry } =
    useFullStreetDefenseStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await shuffleAndDeal();
      setLoading(false);
    })();

    return reset;
  }, [shuffleAndDeal, reset]);

  if (!initialized || loading) return null;

  return (
    <div className="relative mt-auto w-full space-y-1">
      <CurrentBetting />
      <ResultArea />
      <CommunityBoard />
      <ConfirmPosition />
      <div className="flex items-end justify-center gap-2">
        <StackView stack={stack} />
        <div
          className={cn(
            "w-20 font-bold text-sm tabular-nums transition-opacity",
            delta >= 0 ? "text-green-500" : "text-red-500",
          )}
        >
          {delta >= 0 ? "+" : ""}
          {delta} BB
        </div>
      </div>
      <ActionArea />
      <FailureOverlay visible={stack < 1} onRetry={() => void retry()} />
    </div>
  );
}

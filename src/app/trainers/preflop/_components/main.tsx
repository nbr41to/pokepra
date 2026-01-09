"use client";

import { useEffect } from "react";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { FailureOverlay } from "./failure-overlay";
import { OtherPlayers } from "./other-players";
import { ResultArea } from "./result-area";

export function Main() {
  const { initialized, stack, shuffleAndDeal, reset, retry } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  if (!initialized) return null;

  return (
    <div className="relative w-full">
      <OtherPlayers />
      <ActionArea />
      <div className="absolute right-15 bottom-64 z-1">
        <ResultArea />
      </div>
      <FailureOverlay visible={stack > 0} onRetry={retry} />
    </div>
  );
}

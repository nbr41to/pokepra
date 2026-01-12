"use client";

import { useEffect, useState } from "react";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { FailureOverlay } from "./failure-overlay";
import { OtherPlayers } from "./other-players";
import { ResultArea } from "./result-area";

export function Main() {
  const { initialized, stack, shuffleAndDeal, reset, retry } = useActionStore();
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
    <div className="relative w-full">
      <OtherPlayers />
      <ActionArea />
      <div className="absolute right-15 bottom-80 z-1">
        <ResultArea />
      </div>
      <FailureOverlay visible={stack < 1} onRetry={retry} />
    </div>
  );
}

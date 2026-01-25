"use client";

import { useEffect, useState } from "react";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { FailureOverlay } from "./failure-overlay";
import { OtherPlayers } from "./other-players";
import { ResultArea } from "./result-area";
import { SituationInfoArea } from "./situation-info-area";

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
    <div className="relative mt-auto w-full">
      <OtherPlayers />
      <ResultArea className="-mt-8" />
      <SituationInfoArea />
      <ActionArea />
      <FailureOverlay visible={stack < 1} onRetry={retry} />
    </div>
  );
}

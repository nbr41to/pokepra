"use client";

import { useEffect } from "react";
import { useOpenRaiseVsBbStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityArea } from "./community-area";
import { ConfirmPositionArea } from "./confirm-position-area";
import { FailureOverlay } from "./failure-overlay";
import { ResultArea } from "./result-area";
import { VillainHand } from "./villain-hand";

export default function Main() {
  const { gameId, stack, initialize, clear } = useOpenRaiseVsBbStore();

  const handleInitialize = () => {
    initialize({ people: 9, heroStrength: 7 });
  };

  useEffect(() => {
    initialize({ people: 9, heroStrength: 7 });

    return clear;
  }, [initialize, clear]);

  if (!gameId) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between px-8">
        <VillainHand />
        <ResultArea />
      </div>
      <CommunityArea />
      <ConfirmPositionArea />
      <ActionArea />
      <FailureOverlay visible={stack <= 0} onRetry={handleInitialize} />
    </div>
  );
}

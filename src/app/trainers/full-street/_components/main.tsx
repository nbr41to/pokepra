"use client";

import { useEffect } from "react";
import { useHoldemStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityArea } from "./community-area";
import { ConfirmPositionArea } from "./confirm-position-area";
import { FailureOverlay } from "./failure-overlay";
import { StoryViewer } from "./story-viewer";
import { VillainHand } from "./villain-hand";

export default function Main() {
  const { gameId, stack, initialize, clear } = useHoldemStore();

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
      <FailureOverlay visible={stack <= 0} onRetry={handleInitialize} />
      <div className="mx-auto flex w-76">
        <VillainHand className="pb-16" />
        <StoryViewer className="-ml-16" />
      </div>
      <CommunityArea />
      <ConfirmPositionArea />
      <ActionArea />
    </div>
  );
}

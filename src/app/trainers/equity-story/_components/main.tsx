"use client";

import { useEffect } from "react";
import { useHoldemStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityArea } from "./community-area";
import { ConfirmPositionArea } from "./confirm-position-area";
import { StoryReport } from "./story-report";

export default function Main() {
  const { gameId, initialize, clear } = useHoldemStore();

  useEffect(() => {
    initialize({ people: 9, heroStrength: 7 });

    return clear;
  }, [initialize, clear]);

  if (!gameId) return null;

  return (
    <div className="w-full space-y-2">
      <StoryReport />
      <CommunityArea />
      <ConfirmPositionArea />
      <ActionArea />
    </div>
  );
}

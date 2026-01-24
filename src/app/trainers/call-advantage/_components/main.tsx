"use client";

import { useEffect } from "react";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityBoard } from "./community-board";
import { ConfirmPosition } from "./confirm-position";
import { CurrentBetting } from "./current-betting";

export function Main() {
  const { initialized, shuffleAndDeal, clear } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return clear;
  }, [shuffleAndDeal, clear]);

  if (!initialized) return null;

  return (
    <div className="w-full space-y-1">
      <CurrentBetting />
      <CommunityBoard />
      <ConfirmPosition />
      <ActionArea />
    </div>
  );
}

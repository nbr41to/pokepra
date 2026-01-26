"use client";

import { useEffect } from "react";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityBoard } from "./community-board";
import { ConfirmPosition } from "./confirm-position";

export function Main() {
  const { initialized, shuffleAndDeal, clear } = useActionStore();

  useEffect(() => {
    shuffleAndDeal();

    return clear;
  }, [shuffleAndDeal, clear]);

  if (!initialized) return null;

  return (
    <div className="mt-auto w-full space-y-1">
      <CommunityBoard />
      <ConfirmPosition />
      <ActionArea />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useHoldemStore } from "./_utils/state";
import { AnalyticsArea } from "./analytics-area";
import { CommunityArea } from "./community-area";
import { ConfirmPositionArea } from "./confirm-position-area";
import { HeroArea } from "./hero-area";

export default function Main() {
  const { initialize, initialized, shuffleAndDeal, clear } = useHoldemStore();

  useEffect(() => {
    initialize({ people: 9, heroStrengthLimit: 7 });
    shuffleAndDeal();

    return clear;
  }, [initialize, shuffleAndDeal, clear]);

  if (!initialized) return null;

  return (
    <div className="mt-auto flex min-h-0 w-full flex-col justify-between gap-y-2">
      <AnalyticsArea className="min-h-0 flex-1" />
      <div className="">
        <CommunityArea />
        <ConfirmPositionArea />
        <HeroArea />
      </div>
    </div>
  );
}

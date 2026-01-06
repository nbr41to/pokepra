"use client";

import { Crown } from "lucide-react";
import { Suspense } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { simulateVsListWithRanks } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { PlayCard } from "../play-card";
import { Button } from "../ui/button";
import { ConfirmRanking } from "./confirm-ranking";
import { ConfirmRankingSkeleton } from "./confirm-ranking.skeleton";

type Props = {
  hand: string[];
  board: string[];
  position: number;
  disabled?: boolean;
  className?: string;
};

export const ConfirmRankingDrawer = ({
  hand,
  board,
  position,
  disabled = false,
  className,
}: Props) => {
  const equityRanksPromise = simulateVsListWithRanks({
    hero: hand.join(" "),
    board: board.join(" "),
    compare: getHandsByTiers(getTierIndexByPosition(position), [
      ...hand,
      ...board,
    ])
      .join("; ")
      .replaceAll(",", " "),
    trials: 1000,
  });

  return (
    <Drawer direction="top">
      <DrawerTrigger
        asChild
        onClick={(e) => {
          // Blocked aria-hidden on an element の警告回避
          e.currentTarget.blur();
        }}
      >
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon-lg"
          disabled={disabled}
        >
          <Crown size={16} />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[95dvh]! px-1 pb-4">
        <DrawerHeader>
          <DrawerTitle>Hand Ranking</DrawerTitle>
          <div className="flex items-center gap-x-4 py-1">
            <div className="flex gap-x-1">
              {board.map((card) => (
                <PlayCard key={card} className="w-8" size="sm" rs={card} />
              ))}
            </div>
            <DrawerDescription>
              Simulated hand rankings based on the current board.
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <Suspense fallback={<ConfirmRankingSkeleton />}>
          <ConfirmRanking promise={equityRanksPromise} />
        </Suspense>
      </DrawerContent>
    </Drawer>
  );
};

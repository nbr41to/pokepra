"use client";

import { Crown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { PlayCard } from "../play-card";
import { Button } from "../ui/button";
import { ConfirmRanking } from "./confirm-ranking";

type Props = {
  hand: string[];
  board: string[];
  disabled?: boolean;
  className?: string;
};

export const ConfirmRankingDrawer = ({
  hand,
  board,
  disabled = false,
  className,
}: Props) => {
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
                <PlayCard
                  key={card}
                  className="w-8"
                  size="sm"
                  suit={card[1] as "s" | "h" | "d" | "c"}
                  rank={card[0]}
                />
              ))}
            </div>
            <DrawerDescription>
              Simulated hand rankings based on the current board.
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <ConfirmRanking hand={hand} board={board} />
      </DrawerContent>
    </Drawer>
  );
};

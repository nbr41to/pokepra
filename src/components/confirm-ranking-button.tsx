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
import { ConfirmRanking } from "./confirm-ranking";
import { Button } from "./ui/button";

type Props = {
  hand: string[];
  board: string[];
  disabled?: boolean;
  className?: string;
};

export const ConfirmRankingButton = ({
  hand,
  board,
  disabled = false,
  className,
}: Props) => {
  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
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
          <DrawerTitle>Hands Ranking</DrawerTitle>
          <DrawerDescription>
            Simulated hand rankings based on the current board.
          </DrawerDescription>
        </DrawerHeader>

        <ConfirmRanking hand={hand} board={board} />
      </DrawerContent>
    </Drawer>
  );
};

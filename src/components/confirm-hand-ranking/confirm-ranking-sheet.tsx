"use client";

import { Crown } from "lucide-react";
import { Suspense } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { PlayCard } from "../play-card";
import { Button } from "../ui/button";
import { ConfirmRanking } from "./confirm-ranking";
import { ConfirmRankingSkeleton } from "./confirm-ranking.skeleton";

type Props = {
  hand: string[];
  board: string[];
  position: number;
  disabled?: boolean;
  rankPromise: Promise<CombinedPayload>;
  className?: string;
};

export const ConfirmRankingSheet = ({
  board,
  disabled = false,
  rankPromise,
  className,
}: Props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon-lg"
          disabled={disabled}
        >
          <Crown size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh gap-0 px-1 pb-4" side="bottom">
        <SheetHeader>
          <SheetTitle>Hand Ranking</SheetTitle>
          <div className="flex items-center gap-x-4 py-1">
            <div className="flex gap-x-1">
              {board.map((card) => (
                <PlayCard key={card} className="w-8" size="sm" rs={card} />
              ))}
            </div>
            <SheetDescription className="text-left">
              Simulated hand rankings based on the current board.
            </SheetDescription>
          </div>
        </SheetHeader>

        <Suspense fallback={<ConfirmRankingSkeleton />}>
          <ConfirmRanking promise={rankPromise} />
        </Suspense>
      </SheetContent>
    </Sheet>
  );
};

"use client";

import { ChartSpline } from "lucide-react";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { cn } from "@/lib/utils";
import {
  evaluateHandsRanking,
  simulateRangeVsRangeEquity,
  simulateVsListEquity,
} from "@/lib/wasm/simulation";
import { getAllCombos } from "@/utils/dealer";
import { RangeAnalyticsReport } from "./range-analytics-report";

type Props = {
  hero: string[];
  heroRange: string[][];
  board: string[];
  compareRange: string[][];
  disabled?: boolean;
  className?: string;
};

export const RangeAnalyticsSheet = ({
  hero,
  heroRange,
  board,
  compareRange,
  disabled = false,
  className,
}: Props) => {
  const evaluationPromise = evaluateHandsRanking({
    hands: getAllCombos(board),
    board: board,
  });
  const heroEquityPromise = simulateVsListEquity({
    hero: hero,
    board: board,
    compare: compareRange,
    include: { data: true },
    trials: 1000,
  });
  const rangeEquitiesPromise = simulateRangeVsRangeEquity({
    heroRange,
    board,
    villainRange: compareRange,
    trials: 100,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          size="icon-lg"
          disabled={disabled}
        >
          <ChartSpline size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh w-full gap-0 px-1" side="bottom">
        <SheetHeader>
          <SheetTitle>Hand Analytics</SheetTitle>
          <div className="flex items-center gap-x-4 py-1">
            <div className="flex gap-x-1">
              {board.map((card) => (
                <PlayCard key={card} className="w-8" size="sm" rs={card} />
              ))}
            </div>
            <SheetDescription className="text-left">
              Simulated hand analytics based on the current board.
            </SheetDescription>
          </div>
        </SheetHeader>

        <RangeAnalyticsReport
          evaluationPromise={evaluationPromise}
          heroEquityPromise={heroEquityPromise}
          rangeEquitiesPromise={rangeEquitiesPromise}
        />
      </SheetContent>
    </Sheet>
  );
};

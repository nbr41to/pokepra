"use client";

import { ChartColumn } from "lucide-react";
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
import {
  type CombinedPayload,
  evaluateHandsRanking,
} from "@/lib/wasm/simulation";
import { getAllCombos } from "@/utils/dealer";
import { PlayCard } from "../play-card";
import { Button } from "../ui/button";
import { AnalyticsReport } from "./analytics-report";
import { EquityChartSkeleton } from "./equity-chart.skeleton";

type Props = {
  board: string[];
  disabled?: boolean;
  rankPromise?: Promise<CombinedPayload> | null;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export const AnalyticsSheet = ({
  board,
  disabled = false,
  rankPromise,
  onOpenChange,
  className,
}: Props) => {
  const evaluationPromise = evaluateHandsRanking({
    hands: getAllCombos(board),
    board: board,
  });

  return (
    <Sheet onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          size="icon-lg"
          disabled={disabled}
        >
          <ChartColumn size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh gap-0 px-1" side="bottom">
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

        {rankPromise ? (
          <Suspense
            fallback={
              <div className="grid h-[calc(100dvh-120px)] place-content-center">
                <EquityChartSkeleton />
              </div>
            }
          >
            <AnalyticsReport
              rankPromise={rankPromise}
              evaluationPromise={evaluationPromise}
            />
          </Suspense>
        ) : (
          <div className="grid h-[calc(100dvh-120px)] place-content-center">
            <EquityChartSkeleton />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

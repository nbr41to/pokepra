"use client";

import { ChartColumnBig, ChartSpline, Crown, X } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/shadcn/button";
import { SheetClose, SheetFooter } from "@/components/shadcn/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import type {
  EquityPayload,
  HandRankingEntry,
  RangeVsRangePayload,
} from "@/lib/wasm-v1/simulation";
import { ComboRankingContent } from "./combo-ranking-content";
import { EquityDistributionContent } from "./equity-distribution-content";
import { EquityReportContent } from "./equity-report-content";

type Props = {
  evaluationPromise: Promise<HandRankingEntry[]>;
  heroEquityPromise: Promise<EquityPayload>;
  rangeEquitiesPromise: Promise<RangeVsRangePayload>;
};

export const RangeAnalyticsReport = ({
  evaluationPromise,
  heroEquityPromise,
  rangeEquitiesPromise,
}: Props) => {
  return (
    <Tabs defaultValue="ranking" className="relative h-[calc(100dvh-120px)]">
      <TabsContent value="ranking" className="grid place-items-center">
        <Suspense fallback={<div>loading1</div>}>
          <ComboRankingContent
            evaluationPromise={evaluationPromise}
            heroEquityPromise={heroEquityPromise}
          />
        </Suspense>
      </TabsContent>
      <TabsContent value="equity" className="grid place-items-center">
        <Suspense fallback={<div>loading2</div>}>
          <EquityReportContent heroEquityPromise={heroEquityPromise} />
        </Suspense>
      </TabsContent>
      <TabsContent
        value="equity-distribution"
        className="grid place-content-center"
      >
        <Suspense fallback={<div>loading3</div>}>
          <EquityDistributionContent
            heroEquityPromise={heroEquityPromise}
            rangeEquitiesPromise={rangeEquitiesPromise}
          />
        </Suspense>
      </TabsContent>

      <SheetFooter className="fixed bottom-3 left-1/2 z-10 flex w-fit -translate-x-1/2 flex-row items-center">
        <TabsList className="h-12 space-x-3 rounded-full">
          <TabsTrigger value="ranking" className="size-10 rounded-full">
            <Crown />
          </TabsTrigger>
          <TabsTrigger value="equity" className="size-10 rounded-full">
            <ChartColumnBig />
          </TabsTrigger>
          <TabsTrigger
            value="equity-distribution"
            className="size-10 rounded-full"
          >
            <ChartSpline />
          </TabsTrigger>
        </TabsList>

        <SheetClose asChild>
          <Button variant="outline" size="icon-lg" className="rounded-full">
            <X />
          </Button>
        </SheetClose>
      </SheetFooter>
    </Tabs>
  );
};

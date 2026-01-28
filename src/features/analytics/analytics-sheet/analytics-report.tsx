"use client";

import {
  ChartColumnBig,
  Crown,
  GalleryVertical,
  GalleryVerticalEnd,
  X,
} from "lucide-react";
import { use, useCallback, useRef, useState } from "react";
import { SelectPosition } from "@/components/select-position";
import { Button } from "@/components/shadcn/button";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { SheetClose, SheetFooter } from "@/components/shadcn/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { EquityReport } from "@/features/analytics/reports/equity-report";
import type { CombinedPayload, HandRankingEntry } from "@/lib/wasm/simulation";
import { expandStartingHands, toHandSymbol } from "@/utils/hand-range";
import { getSettingOpenRange } from "@/utils/setting";
import { ComboRankingWithRanksReport } from "../reports/combo-ranking-with-ranks-report";

type Props = {
  rankPromise: Promise<CombinedPayload>;
  evaluationPromise: Promise<HandRankingEntry[]>;
};

export const AnalyticsReport = ({ rankPromise, evaluationPromise }: Props) => {
  const ranking = use(evaluationPromise);
  const result = use(rankPromise);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [selectedRange, setSelectedRange] = useState(7);
  const filteredResultData = result.data.filter(({ hand }) => {
    const selectedRangeHandStrings =
      getSettingOpenRange()[
        selectedRange < 3 ? selectedRange + 6 : selectedRange - 3
      ];
    const isHeroHand = hand === result.hand;

    return (
      isHeroHand ||
      expandStartingHands(selectedRangeHandStrings).includes(toHandSymbol(hand))
    );
  });

  const filteredResult = {
    ...result,
    equity:
      1 -
      filteredResultData.reduce(
        (acc, entry) => acc + (entry.win + entry.tie / 2) / entry.count,
        0,
      ) /
        filteredResultData.length,
    data: filteredResultData,
  };

  const scrollToMyHand = (smooth = false) => {
    const element = document.getElementById(result.hand);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };

  const scrollToTop = useCallback((smooth = false) => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    if (!viewport) return;
    viewport.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  return (
    <Tabs defaultValue="equity" className="relative h-[calc(100dvh-120px)]">
      <div className="absolute -top-1.5 left-1/2 z-20 w-full -translate-x-1/2">
        <SelectPosition
          total={9}
          value={selectedRange}
          setValue={setSelectedRange}
        />
      </div>
      <TabsContent value="equity" className="grid place-items-center">
        <EquityReport payload={filteredResult} />
      </TabsContent>
      <TabsContent value="ranking">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[calc(100dvh-140px)] w-full"
        >
          <ComboRankingWithRanksReport
            className="pt-12 pb-24"
            result={filteredResult}
            ranking={ranking}
            onScroll={scrollToMyHand}
          />
        </ScrollArea>
        <div className="absolute right-2 bottom-7 z-10 flex flex-col gap-y-2 rounded-full opacity-80">
          <Button
            className="rounded-full"
            size="icon-lg"
            onClick={() => scrollToTop(true)}
          >
            <GalleryVerticalEnd className="rotate-180" />
          </Button>
          <Button
            className="rounded-full"
            size="icon-lg"
            onClick={() => scrollToMyHand(true)}
          >
            <GalleryVertical />
          </Button>
        </div>
      </TabsContent>

      <SheetFooter className="fixed bottom-3 left-1/2 z-10 flex w-fit -translate-x-1/2 flex-row items-center">
        <TabsList className="h-12 rounded-full">
          <TabsTrigger value="equity" className="h-10 rounded-full">
            <ChartColumnBig />
            EQ
          </TabsTrigger>
          <TabsTrigger value="ranking" className="h-10 rounded-full">
            <Crown />
            Ranking
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

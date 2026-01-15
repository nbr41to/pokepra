"use client";

import {
  ChartColumnBig,
  Crown,
  GalleryVertical,
  GalleryVerticalEnd,
  X,
} from "lucide-react";
import { use, useCallback, useRef, useState } from "react";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CombinedPayload, HandRankingEntry } from "@/lib/wasm/simulation";
import {
  getInitialHandRangeArray,
  getRangeStrengthByPosition,
  toHandSymbol,
} from "@/utils/hand-range";
import { SelectPosition } from "../select-position";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { ComboRanking } from "./combo-ranking";
import { EquityChart } from "./equity-chart";

type Props = {
  rankPromise: Promise<CombinedPayload>;
  evaluationPromise: Promise<HandRankingEntry[]>;
};

export const AnalyticsReport = ({ rankPromise, evaluationPromise }: Props) => {
  const result = use(rankPromise);
  const ranking = use(evaluationPromise);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [selectedRange, setSelectedRange] = useState(7);
  const filteredResult = {
    ...result,
    data: result.data.filter(({ hand }) => {
      const strength = getRangeStrengthByPosition(selectedRange);
      const selectedRangeHandStrings = getInitialHandRangeArray()
        .slice(0, strength)
        .flat();
      const isHeroHand = hand === result.hand;

      return (
        isHeroHand || selectedRangeHandStrings.includes(toHandSymbol(hand))
      );
    }),
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
      <div className="absolute -top-2 left-1/2 z-20 w-full -translate-x-1/2">
        <SelectPosition
          total={9}
          value={selectedRange}
          setValue={setSelectedRange}
        />
      </div>
      <TabsContent value="equity" className="grid place-items-center">
        <EquityChart result={filteredResult} />
      </TabsContent>
      <TabsContent value="ranking">
        <ScrollArea ref={scrollAreaRef} className="h-[calc(100dvh-120px)]">
          <ComboRanking
            result={filteredResult}
            ranking={ranking}
            onScroll={scrollToMyHand}
          />
        </ScrollArea>
        <div className="absolute right-2 bottom-4 z-10 flex flex-col gap-y-2 rounded-full opacity-80">
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

      <SheetFooter className="absolute bottom-0 left-1/2 z-10 flex w-fit -translate-x-1/2 flex-row items-center">
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

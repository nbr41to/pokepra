"use client";

import { GalleryVertical, Grid, List, X } from "lucide-react";
import { use } from "react";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CombinedPayload } from "@/lib/wasm/simulation";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { HandRankingGrid } from "./hand-ranking-grid";
import { HandRankingList } from "./hand-ranking-list";

type Props = {
  promise: Promise<CombinedPayload>;
};

export const ConfirmRanking = ({ promise }: Props) => {
  const result = use(promise);
  console.log(result);

  const scrollToMyHand = (smooth = false) => {
    const element = document.getElementById(result.hand);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };
  const heroIndex =
    result.data.findIndex((data) => data.hand === result.hand) + 1;

  const eqAve =
    (result.data.reduce(
      (acc, cur) => acc + (cur.win + cur.tie / 2) / cur.count,
      0,
    ) /
      result.data.length) *
    100;

  return (
    <>
      <Tabs defaultValue="list" className="px-1">
        <div className="mb-1 flex items-end justify-between gap-x-4">
          <div className="flex grow items-end justify-between">
            <span className="font-bold text-sm">
              EQAve: {eqAve.toFixed(1)}%
            </span>
            <span className="text-xs">
              {heroIndex}/{result.data.length}(
              {((heroIndex / result.data.length) * 100).toFixed(2)}%)
            </span>
          </div>
          <TabsList>
            <TabsTrigger value="list">
              <List />
              List
            </TabsTrigger>
            <TabsTrigger value="grid">
              <Grid />
              Grid
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="grow">
          <ScrollArea className="relative h-[calc(100dvh-200px)]">
            <HandRankingList result={result} onScroll={scrollToMyHand} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="grid">
          <ScrollArea className="relative h-[calc(100dvh-200px)]">
            <HandRankingGrid result={result} onScroll={scrollToMyHand} />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <SheetFooter className="absolute bottom-6 left-0 z-10 w-full">
        <SheetClose asChild>
          <Button
            variant="outline"
            size="icon-lg"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-90"
          >
            <X />
          </Button>
        </SheetClose>
        <Button
          className="absolute right-2 bottom-0 rounded-full opacity-80"
          size="icon-lg"
          onClick={() => scrollToMyHand(true)}
        >
          <GalleryVertical />
        </Button>
      </SheetFooter>
    </>
  );
};

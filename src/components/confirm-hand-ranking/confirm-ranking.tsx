"use client";

import { GalleryVertical, Grid, List, X } from "lucide-react";
import { use } from "react";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
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

  const scrollToMyHand = (smooth = false) => {
    const element = document.getElementById(result.hand);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };

  return (
    <>
      <Tabs defaultValue="list" className="px-1">
        <div className="mb-1 flex items-end justify-between">
          <span>
            {(
              (result.data.findIndex((data) => data.hand === result.hand) /
                result.data.length) *
              100
            ).toFixed(2)}
            % ({result.data.length} hands)
          </span>
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
          <ScrollArea className="relative h-[65dvh]">
            <HandRankingList result={result} onScroll={scrollToMyHand} />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="grid">
          <ScrollArea className="relative h-[65dvh]">
            <HandRankingGrid result={result} onScroll={scrollToMyHand} />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <DrawerFooter className="absolute bottom-6 left-0 z-10 w-full">
        <DrawerClose asChild>
          <Button
            variant="outline"
            size="icon-lg"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-90"
          >
            <X />
          </Button>
        </DrawerClose>
        <Button
          className="absolute right-2 bottom-0 rounded-full opacity-80"
          size="icon-lg"
          onClick={() => scrollToMyHand(true)}
        >
          <GalleryVertical />
        </Button>
      </DrawerFooter>
    </>
  );
};

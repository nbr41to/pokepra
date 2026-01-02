"use client";

import { GalleryVertical, Grid, List, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getPokerRanking } from "@/app/score-attack/_actions/get-hand-ranking";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { ConfirmRankingSkeleton } from "./confirm-ranking.skeleton";
import { HandRankingGrid } from "./hand-ranking-grid";
import { HandRankingList } from "./hand-ranking-list";

// TODO: app/に依存しているのをやめたい
type RankingResult = {
  hand: string[];
  score: number;
  iterate: number;
  result: {
    name: string;
    rank: number;
    count: number;
  }[];
};

const resultCache = new Map<string, RankingResult[]>();

type Props = {
  hand: string[];
  board: string[];
};

export const ConfirmRanking = ({ hand, board }: Props) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RankingResult[]>([]);

  const scrollToMyHand = (smooth = false) => {
    const element = document.getElementById(hand.join(","));
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  };

  useEffect(() => {
    const boardKey = board.join(",");
    const cached = resultCache.get(boardKey);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const results = await getPokerRanking({ board, hand });
      resultCache.clear();
      resultCache.set(boardKey, results);
      setResults(results);
      setLoading(false);
    })();
  }, [board, hand]);

  if (loading) return <ConfirmRankingSkeleton />;

  return (
    <>
      <Tabs defaultValue="list" className="px-1">
        <div className="mb-1 flex items-end justify-between">
          <span>{results.length} hands</span>
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

        <TabsContent value="list">
          <ScrollArea className="relative h-[70dvh]">
            <HandRankingList
              hand={hand}
              results={results}
              onScroll={scrollToMyHand}
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="grid">
          <ScrollArea className="relative h-[70dvh]">
            <HandRankingGrid
              hand={hand}
              results={results}
              onScroll={scrollToMyHand}
            />
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

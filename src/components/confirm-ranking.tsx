"use client";

import { GalleryVertical, Grid, List, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { iterateSimulations } from "@/lib/poker/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { ConfirmRankingSkeleton } from "./confirm-ranking.skeleton";
import { HandRankingGrid } from "./hand-ranking-grid";
import { HandRankingList } from "./hand-ranking-list";
import { Button } from "./ui/button";

type Props = {
  hand: string[];
  board: string[];
  className?: string;
};

export const ConfirmRanking = ({ hand, board, className }: Props) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    {
      hand: string[];
      score: number;
      iterate: number;
      result: {
        name: string;
        rank: number;
        count: number;
      }[];
    }[]
  >([]);

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
    const runSimulation = async () => {
      setLoading(true);
      const results = await simulate({ board });
      setResults(results);
      setLoading(false);
    };

    runSimulation();
  }, [board]);

  if (loading) return <ConfirmRankingSkeleton />;

  return (
    <>
      <Tabs defaultValue="list" className="px-1">
        <TabsList className="mb-1 ml-auto">
          <TabsTrigger value="list">
            <List />
            List
          </TabsTrigger>
          <TabsTrigger value="grid">
            <Grid />
            Grid
          </TabsTrigger>
        </TabsList>

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

const simulate = async ({ board }: { board: string[] }) => {
  // 重い処理が入るので先に Web Worker に逃がす必要がある
  await new Promise((resolve) => setTimeout(resolve, 0));

  const timeStart = performance.now();
  console.log("startSimulation: start");

  const allHands = getHandsByTiers(5, board);

  const ITERATE_COUNT = 1000;

  const results = allHands.map((hand) => {
    const result = iterateSimulations([...board, ...hand], ITERATE_COUNT);
    const score = result.reduce((acc, cur) => acc + cur.count * cur.rank, 0);

    return {
      hand,
      score,
      iterate: ITERATE_COUNT,
      result,
    };
  });

  const durationMs = performance.now() - timeStart;
  console.log(`startSimulation: end ${durationMs.toFixed(2)}ms`);

  return results;
};

"use client";

import { GalleryVertical, Grid, List, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import handRankJson from "@/data/preflop-hand-ranking.json";
import { iterateSimulations } from "@/lib/poker/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getHandString } from "@/utils/preflop-range";
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
      await new Promise((resolve) => setTimeout(resolve, 200)); // アニメーション用のフレーム確保
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

async function getPokerRanking({
  hand,
  board,
}: {
  hand: string[];
  board: string[];
}): Promise<RankingResult[]> {
  const timeStart = performance.now(); // 計測開始

  const allHands = getHandsByTiers(5, [...board, ...hand]);

  const ITERATE_COUNT = 1000;

  const results = [hand, ...allHands].map((hand) => {
    const result = iterateSimulations([...board, ...hand], ITERATE_COUNT);
    const score = result.reduce((acc, cur) => {
      const handString = getHandString(hand);
      const handEquity = handRankJson.find((hr) => hr.hand === handString); // スターティングハンドの勝率（0% ~ 100%）
      const probability = cur.count / ITERATE_COUNT; // シュミレーション時の発生確率（0 ~ 1）

      const EPS = 1e-9; // ゼロ除算防止用微小値

      // rank: 1(High) ... 9(StraightFlush) を想定
      const BASELINE_BY_RANK: Record<number, number> = {
        1: 0.1741192, // High card (Ace high or less)
        2: 0.43822546, // One pair
        3: 0.23495536, // Two pair
        4: 0.0482987, // Trips
        5: 0.04619382, // Straight
        6: 0.03025494, // Flush
        7: 0.02596102, // Full house
        8: 0.00168067, // Quads
        9: 0.00031083, // Straight flush (incl. royal)
      };

      // 係数：まずはこの辺から（後でランキングの見た目で微調整）
      const ALPHA_EQUITY = 0.35; // キッカー(proxy)の効かせ具合
      const BETA_RARITY = 0.12; // “珍しさ”補正（大きくしすぎ注意）

      // cur.rank 1..9 を 0..1 に正規化（役カテゴリの強さ）
      const rankStrength = (cur.rank - 1) / 8;

      // preflop equity 0..100 を 0..1 に（無ければ 0.5 扱い）
      const equity01 = (handEquity?.player2 ?? 50) / 100;

      // 「同役内の強さ」扱いにするため 0.5 を中心に（強いほど +、弱いほど -）
      const kickerProxy = equity01 - 0.5;

      // その役が “平均より出やすい/出にくい” を対数比で補正（正規化）
      const baseline = BASELINE_BY_RANK[cur.rank] ?? 1 / 9;
      const rarityBonus = Math.log((probability + EPS) / (baseline + EPS));

      // その役になった時の価値（カテゴリ + キッカーproxy）
      // ※カテゴリ強度に確率を掛けて期待値にして足す
      const valueWhenOccurs =
        rankStrength + ALPHA_EQUITY * kickerProxy + BETA_RARITY * rarityBonus;

      // reduce の中で加算
      return acc + probability * valueWhenOccurs;
    }, 0);

    return {
      hand,
      score: score / 10,
      iterate: ITERATE_COUNT,
      result,
    };
  });

  const durationMs = performance.now() - timeStart;
  console.log(`getPokerRanking: end in ${durationMs} ms`);

  return results;
}

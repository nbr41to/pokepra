import { ChartColumnStacked, ChartSpline, Crown, Grid3X3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getAllCombos } from "@/utils/dealer";
import { getRangeStrengthByPosition } from "@/utils/hand-range";
import { getSettingOpenRange } from "@/utils/setting";
import {
  getHandRankingInRange,
  simHandVsRangeEquityWithRanks,
  simRangeVsRangeEquity,
} from "./_utils/monte-carlo";
import { useHoldemStore } from "./_utils/state";
import { AnalyticsEquityRanking } from "./analytics-equity-ranking";
import { AnalyticsHeroRangeVsVillainRange } from "./analytics-hero-range-vs-villain-range";
import { AnalyticsHeroVsVillainRange } from "./analytics-hero-vs-villain-range";

type AnalysisResult = {
  ranking: Awaited<ReturnType<typeof getHandRankingInRange>>;
  heroEquity: Awaited<ReturnType<typeof simHandVsRangeEquityWithRanks>>;
  rangeEquity: Awaited<ReturnType<typeof simRangeVsRangeEquity>>;
};

const analysisCache = new Map<string, AnalysisResult>();
const analysisPromiseCache = new Map<string, Promise<AnalysisResult>>();

const analyze = ({
  hero,
  board,
  position,
  ranges,
}: {
  hero: string[];
  board: string[];
  position: number;
  ranges: string[];
}): Promise<AnalysisResult> => {
  return Promise.all([
    getHandRankingInRange(getAllCombos(board), board),
    simHandVsRangeEquityWithRanks(hero, ranges[8], board),
    simRangeVsRangeEquity(
      ranges[getRangeStrengthByPosition(position) - 1],
      ranges[8],
      board,
    ),
  ]).then(([ranking, heroEquity, rangeEquity]) => ({
    ranking,
    heroEquity,
    rangeEquity,
  }));
};

type Props = {
  className?: string;
};
export const AnalyticsArea = ({ className }: Props) => {
  const { position, hero, board } = useHoldemStore();
  const [data, setData] = useState<AnalysisResult | null>(null);

  const ranges = getSettingOpenRange();
  const analysisKey = useMemo(() => {
    const heroKey = hero.join("-");
    const boardKey = board.join("-");
    const rangesKey = ranges.join("|");
    return `${heroKey}:${boardKey}:${position}:${rangesKey}`;
  }, [hero, board, position, ranges]);

  useEffect(() => {
    let active = true;
    const cached = analysisCache.get(analysisKey);
    if (cached) {
      setData(cached);
      return () => {
        active = false;
      };
    }

    let promise = analysisPromiseCache.get(analysisKey);
    if (!promise) {
      promise = analyze({ hero, board, position, ranges });
      analysisPromiseCache.set(analysisKey, promise);
    }

    promise
      .then((result) => {
        if (!active) return;
        analysisCache.set(analysisKey, result);
        setData(result);
      })
      .catch(() => {
        analysisPromiseCache.delete(analysisKey);
      })
      .finally(() => {
        analysisPromiseCache.delete(analysisKey);
      });

    return () => {
      active = false;
    };
  }, [analysisKey, board, hero, position, ranges]);

  if (!data) {
    return (
      <Tabs
        defaultValue="hero-equity"
        className={cn("flex min-h-0 flex-col justify-between", className)}
      >
        <div className="min-h-0 flex-1" />
        <TabsList className="mx-auto h-12 w-fit rounded-full">
          <TabsTrigger value="hero-equity" className="size-12 rounded-full">
            <ChartColumnStacked />
          </TabsTrigger>
          <TabsTrigger
            value="compare-equity-distribution"
            className="size-12 rounded-full"
          >
            <ChartSpline />
          </TabsTrigger>
          <TabsTrigger value="equity-ranking" className="size-12 rounded-full">
            <Crown />
          </TabsTrigger>
          <TabsTrigger value="hero-range" className="size-12 rounded-full">
            <Grid3X3 />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Tabs
      defaultValue="hero-equity"
      className={cn("flex min-h-0 flex-col justify-between", className)}
    >
      <div className="min-h-0 flex-1 overflow-y-scroll">
        <AnalyticsHeroVsVillainRange heroEquity={data.heroEquity} />
        <AnalyticsHeroRangeVsVillainRange
          heroEquity={data.heroEquity}
          rangeEquity={data.rangeEquity}
        />
        <AnalyticsEquityRanking
          ranking={data.ranking}
          heroEquity={data.heroEquity}
        />
      </div>

      <TabsList className="mx-auto h-12 w-fit rounded-full">
        <TabsTrigger value="hero-equity" className="size-12 rounded-full">
          <ChartColumnStacked />
        </TabsTrigger>
        <TabsTrigger
          value="compare-equity-distribution"
          className="size-12 rounded-full"
        >
          <ChartSpline />
        </TabsTrigger>
        <TabsTrigger value="equity-ranking" className="size-12 rounded-full">
          <Crown />
        </TabsTrigger>
        <TabsTrigger value="hero-range" className="size-12 rounded-full">
          <Grid3X3 />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

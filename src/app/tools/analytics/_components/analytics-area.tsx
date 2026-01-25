import { ChartColumnStacked, ChartSpline, Crown, Grid3X3 } from "lucide-react";
import { useEffect, useState } from "react";
import { EquityChartSkeleton } from "@/components/analytics-sheet/equity-chart.skeleton";
import { Spinner } from "@/components/shadcn/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { cn } from "@/lib/utils";
import type {
  CombinedPayload,
  HandRankingEntry,
  RangeVsRangePayload,
} from "@/lib/wasm/simulation";
import { getSettingOpenRange } from "@/utils/setting";
import { useHoldemStore } from "./_utils/state";
import { AnalyticsEquityRanking } from "./analytics-equity-ranking";
import { AnalyticsHeroRangeVsVillainRange } from "./analytics-hero-range-vs-villain-range";
import { AnalyticsHeroVsVillainRange } from "./analytics-hero-vs-villain-range";
import { AnalyticsRangeEquity } from "./analytics-range-equity";

type AnalysisResult = {
  ranking: HandRankingEntry[];
  heroEquity: CombinedPayload;
  rangeEquity: RangeVsRangePayload;
};

type Props = {
  className?: string;
};
export const AnalyticsArea = ({ className }: Props) => {
  const {
    position,
    hero,
    board,
    street,
    getAnalysisResult,
    simulationLoading,
  } = useHoldemStore();
  const [data, setData] = useState<AnalysisResult | null>(null);

  const ranges = getSettingOpenRange();

  useEffect(() => {
    let active = true;
    getAnalysisResult({ hero, board, position, ranges, street })
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [board, hero, position, ranges, street, getAnalysisResult]);

  if (!data) {
    return (
      <Tabs
        defaultValue="hero-equity"
        className={cn("flex min-h-0 flex-col justify-between", className)}
      >
        <div className="min-h-0 flex-1 overflow-y-scroll">
          <div className="flex min-h-full flex-col justify-end">
            <EquityChartSkeleton />
          </div>
        </div>

        <TabsList className="mx-auto h-12 w-fit rounded-full">
          <TabsTrigger value="hero-equity" className="size-12 rounded-full">
            <ChartColumnStacked className="text-green-600" />
          </TabsTrigger>
          <TabsTrigger value="equity-ranking" className="size-12 rounded-full">
            <Crown className="text-yellow-600" />
          </TabsTrigger>
          <TabsTrigger
            value="compare-equity-distribution"
            className="size-12 rounded-full"
          >
            <ChartSpline className="text-indigo-600" />
          </TabsTrigger>
          <TabsTrigger value="hero-range" className="size-12 rounded-full">
            <Grid3X3 className="text-red-600" />
          </TabsTrigger>
          <TabsTrigger value="villain-range" className="size-12 rounded-full">
            <Grid3X3 className="text-blue-600" />
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
      <div className="relative min-h-0 flex-1 overflow-y-scroll">
        {simulationLoading && (
          <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center gap-x-2 bg-background/40 text-muted-foreground">
            <Spinner className="size-8" />
            <span>Simulating...</span>
          </div>
        )}
        <AnalyticsHeroVsVillainRange heroEquity={data.heroEquity} />
        <AnalyticsEquityRanking
          ranking={data.ranking}
          heroEquity={data.heroEquity}
        />
        <AnalyticsHeroRangeVsVillainRange
          heroEquity={data.heroEquity}
          rangeEquity={data.rangeEquity}
        />
        <AnalyticsRangeEquity
          hero={data.heroEquity.hand}
          tabValue="hero-range"
          rangeEquity={data.rangeEquity.hero}
        />
        <AnalyticsRangeEquity
          tabValue="villain-range"
          rangeEquity={data.rangeEquity.villain}
        />
      </div>

      <TabsList className="mx-auto h-12 w-fit rounded-full">
        <TabsTrigger value="hero-equity" className="size-12 rounded-full">
          <ChartColumnStacked className="text-green-600" />
        </TabsTrigger>
        <TabsTrigger value="equity-ranking" className="size-12 rounded-full">
          <Crown className="text-yellow-600" />
        </TabsTrigger>
        <TabsTrigger
          value="compare-equity-distribution"
          className="size-12 rounded-full"
        >
          <ChartSpline className="text-indigo-600" />
        </TabsTrigger>
        <TabsTrigger value="hero-range" className="size-12 rounded-full">
          <Grid3X3 className="text-red-600" />
        </TabsTrigger>
        <TabsTrigger value="villain-range" className="size-12 rounded-full">
          <Grid3X3 className="text-blue-600" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

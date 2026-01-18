import { ChartColumnStacked, ChartSpline, Crown } from "lucide-react";
import { Activity, Suspense } from "react";
import { EquityChartSkeleton } from "@/components/analytics-sheet/equity-chart.skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getAllCombos } from "@/utils/dealer";
import {
  getRangeStrengthByPosition,
  getSettingOpenRange,
} from "@/utils/hand-range";
import {
  getHandRankingInRange,
  simHandVsRangeEquityWithRanks,
  simRangeVsRangeEquity,
} from "./_utils/monte-carlo";
import { useHoldemStore } from "./_utils/state";
import { AnalyticsEquityRanking } from "./analytics-equity-ranking";
import { AnalyticsHeroRangeVsVillainRange } from "./analytics-hero-range-vs-villain-range";
import { AnalyticsHeroVsVillainRange } from "./analytics-hero-vs-villain-range";

type Props = {
  className?: string;
};
export const AnalyticsArea = ({ className }: Props) => {
  const { position, hero, board } = useHoldemStore();

  const ranges = getSettingOpenRange();
  const rankingPromise = getHandRankingInRange(getAllCombos(board), board);
  const simHandVsRangeEquityWithRanksPromise = simHandVsRangeEquityWithRanks(
    hero,
    ranges[1],
    board,
  );
  const simRangeVsRangeEquityPromise = simRangeVsRangeEquity(
    ranges[getRangeStrengthByPosition(position)],
    ranges[1],
    board,
  );

  return (
    <Tabs
      defaultValue="hero-equity"
      className={cn("flex min-h-0 flex-col justify-between", className)}
    >
      <div className="min-h-0 flex-1 overflow-y-scroll">
        <Activity key={position + [hero, board].join("-")}>
          <Suspense
            fallback={
              <TabsContent
                value="hero-equity"
                className="flex h-full flex-col justify-end"
              >
                <EquityChartSkeleton />
              </TabsContent>
            }
          >
            <AnalyticsHeroVsVillainRange
              simHandVsRangeEquityWithRanksPromise={
                simHandVsRangeEquityWithRanksPromise
              }
            />
          </Suspense>
        </Activity>
        <Suspense fallback={"aaaa"}>
          <AnalyticsHeroRangeVsVillainRange
            hero={hero}
            simRangeVsRangeEquityPromise={simRangeVsRangeEquityPromise}
          />
        </Suspense>
        <Suspense>
          <AnalyticsEquityRanking
            rankingPromise={rankingPromise}
            simHandVsRangeEquityWithRanksPromise={
              simHandVsRangeEquityWithRanksPromise
            }
          />
        </Suspense>
      </div>

      <TabsList>
        <TabsTrigger value="hero-equity">
          <ChartColumnStacked />
        </TabsTrigger>
        <TabsTrigger value="compare-equity-distribution">
          <ChartSpline />
        </TabsTrigger>
        <TabsTrigger value="equity-ranking">
          <Crown />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

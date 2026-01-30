import { TabsContent } from "@/components/shadcn/tabs";
import { ComboRankingWithRanksReport } from "@/features/analytics/reports/combo-ranking-with-ranks-report";
import type { CombinedPayload, HandRankingEntry } from "@/lib/wasm/types";

type Props = {
  ranking: HandRankingEntry[];
  heroEquity: CombinedPayload;
};
export const AnalyticsEquityRanking = ({ ranking, heroEquity }: Props) => {
  const result = heroEquity;

  return (
    <TabsContent value="equity-ranking">
      <ComboRankingWithRanksReport result={result} ranking={ranking} />
    </TabsContent>
  );
};

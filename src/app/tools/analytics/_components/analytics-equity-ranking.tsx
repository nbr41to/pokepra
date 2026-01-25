import { TabsContent } from "@/components/shadcn/tabs";
import { ComboRankingReport } from "@/features/analytics/reports/combo-ranking-report";
import type { CombinedPayload, HandRankingEntry } from "@/lib/wasm/types";

type Props = {
  ranking: HandRankingEntry[];
  heroEquity: CombinedPayload;
};
export const AnalyticsEquityRanking = ({ ranking, heroEquity }: Props) => {
  const result = heroEquity;

  return (
    <TabsContent value="equity-ranking" className="pt-12 pb-24">
      <ComboRankingReport result={result} ranking={ranking} />
    </TabsContent>
  );
};

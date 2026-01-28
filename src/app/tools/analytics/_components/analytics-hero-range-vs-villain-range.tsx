import { TabsContent } from "@/components/shadcn/tabs";
import { EquityDistributionReport } from "@/features/analytics/reports/equity-distribution-report";
import type { CombinedPayload, RangeVsRangePayload } from "@/lib/wasm/types";

type Props = {
  heroEquity: CombinedPayload;
  rangeEquity: RangeVsRangePayload;
};
export const AnalyticsHeroRangeVsVillainRange = ({
  heroEquity,
  rangeEquity,
}: Props) => {
  return (
    <TabsContent
      value="compare-equity-distribution"
      className="flex min-h-full flex-col justify-end"
    >
      <EquityDistributionReport
        heroEquity={heroEquity.equity}
        rangeEquity={rangeEquity}
      />
    </TabsContent>
  );
};

import { TabsContent } from "@/components/shadcn/tabs";
import { RangeEquitiesReport } from "@/features/analytics/reports/range-equities-report";
import type { RangeEquityEntry } from "@/lib/wasm-v1/types";

type Props = {
  tabValue: "hero-range" | "villain-range";
  rangeEquity: RangeEquityEntry[];
  hero?: string;
};
export const AnalyticsRangeEquity = ({
  tabValue,
  rangeEquity,
  hero,
}: Props) => {
  return (
    <TabsContent value={tabValue} className="min-h-full">
      <RangeEquitiesReport rangeEquity={rangeEquity} hero={hero} />
    </TabsContent>
  );
};

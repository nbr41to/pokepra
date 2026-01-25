import { TabsContent } from "@/components/shadcn/tabs";
import { EquityReport } from "@/features/analytics/reports/equity-report";
import type { CombinedPayload } from "@/lib/wasm/simulation";

type Props = {
  heroEquity: CombinedPayload;
};
export const AnalyticsHeroVsVillainRange = ({ heroEquity }: Props) => {
  return (
    <TabsContent
      value="hero-equity"
      className="flex min-h-full flex-col justify-end"
    >
      <EquityReport result={heroEquity} />
    </TabsContent>
  );
};

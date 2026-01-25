import { EquityChart } from "@/components/analytics-sheet/equity-chart";
import { TabsContent } from "@/components/shadcn/tabs";
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
      <EquityChart result={heroEquity} />
    </TabsContent>
  );
};

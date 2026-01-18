import { use } from "react";
import { EquityChart } from "@/components/analytics-sheet/equity-chart";
import { TabsContent } from "@/components/ui/tabs";
import type { CombinedPayload } from "@/lib/wasm/types";

type Props = {
  simHandVsRangeEquityWithRanksPromise: Promise<CombinedPayload>;
};
export const AnalyticsHeroVsVillainRange = ({
  simHandVsRangeEquityWithRanksPromise,
}: Props) => {
  const result = use(simHandVsRangeEquityWithRanksPromise);

  return (
    <TabsContent
      value="hero-equity"
      className="flex h-full flex-col justify-end"
    >
      <EquityChart result={result} />
    </TabsContent>
  );
};

import { use } from "react";
import type { EquityPayload, RangeVsRangePayload } from "@/lib/wasm/types";
import { EquityDistributionReport } from "../reports/equity-distribution-report";

type Props = {
  heroEquityPromise: Promise<EquityPayload>;
  rangeEquitiesPromise: Promise<RangeVsRangePayload>;
};

export const EquityDistributionContent = ({
  heroEquityPromise,
  rangeEquitiesPromise,
}: Props) => {
  const heroEquityPayload = use(heroEquityPromise);
  const rangeEquitiesPayload = use(rangeEquitiesPromise);

  return (
    <EquityDistributionReport
      className="px-4"
      heroEquity={heroEquityPayload.equity}
      rangeEquity={rangeEquitiesPayload}
    />
  );
};

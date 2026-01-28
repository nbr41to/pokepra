import { use } from "react";
import type { EquityPayload } from "@/lib/wasm/types";
import { EquityReport } from "../reports/equity-report";

type Props = {
  heroEquityPromise: Promise<EquityPayload>;
};

export const EquityReportContent = ({ heroEquityPromise }: Props) => {
  const heroEquityPayload = use(heroEquityPromise);
  console.log(heroEquityPayload);

  return <EquityReport payload={heroEquityPayload} />;
};

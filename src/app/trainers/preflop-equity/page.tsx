import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Preflop" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Preflop Equity"
        description="Preflopで参加するポジションが早いほど後ろに強い相手がいる確率が高いということを体感できるゲームです。ついでにEVと呼ばれる期待値についても学べます。"
        hidable
      />
      <Main />
    </>
  );
}

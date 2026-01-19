import type { Metadata } from "next";
import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Preflop" };

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 pt-8">
      <HeaderTitle
        title="Preflop Equity"
        description="Preflopで参加するポジションが早いほど後ろに強い相手がいる確率が高いということを体感できるゲームです。ついでにEVと呼ばれる期待値についても学べます。"
        hidable
      />
      <Main />
    </div>
  );
}

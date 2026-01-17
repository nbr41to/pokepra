import type { Metadata } from "next";
import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Flop Equity Quiz" };

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 pt-8">
      <HeaderTitle
        title="Flop Equity Quiz"
        description="フロップの勝率を当てるトレーニングです。"
        hidable
      />
      <Main />
    </div>
  );
}

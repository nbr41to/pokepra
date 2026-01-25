import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Flop Equity Quiz" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Flop Equity Quiz"
        description="フロップの勝率を当てるトレーニングです。"
        hidable
      />
      <Main />
    </>
  );
}

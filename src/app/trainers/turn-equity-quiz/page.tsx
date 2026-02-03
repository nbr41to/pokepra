import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Turn Equity Quiz" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Turn Equity Quiz"
        description="ターンの勝率を当てるトレーニングです。"
        hidable
      />
      <Main />
    </>
  );
}

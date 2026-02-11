import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Offense" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Offense"
        description="Hero hand と複数 Villain hand を見て、check/fold/bet を選ぶ攻撃判断トレーナーです。"
        hidable
      />
      <Main />
    </>
  );
}

import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import Main from "./_components/main";

export const metadata: Metadata = { title: "Six Max Evaluator" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Six Max Evaluator"
        description="6max・100BBで各アクションの良し悪し（EV）を統計的に評価してくれる練習ゲームです。"
        hidable
      />
      <Main />
    </>
  );
}

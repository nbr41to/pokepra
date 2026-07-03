import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import Main from "./_components/main";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Analytics"
        description="様々なシチュエーションにおける勝率を分析できます。"
        hidable
      />
      <Main />
    </>
  );
}

import type { Metadata } from "next";
import { HeaderTitle } from "@/components/header-title";
import Main from "./_components/main";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 pt-8 pb-12">
      <HeaderTitle
        title="Analytics"
        description="様々なシチュエーションにおける勝率を分析できます。"
        hidable
      />
      <Main />
    </div>
  );
}

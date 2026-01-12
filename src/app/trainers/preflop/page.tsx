import type { Metadata } from "next";
import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Preflop" };

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 pt-8">
      <HeaderTitle title="Preflop Equity Simulator" />
      <Main />
    </div>
  );
}

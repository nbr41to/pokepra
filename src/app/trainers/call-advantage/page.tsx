import type { Metadata } from "next";
import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Call Advantage" };

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 pt-8">
      <HeaderTitle
        title="Call Advantage"
        description="ポストフロップの局面で、コールすることによって得られるアドバンテージを学べます。"
        hidable
      />
      <Main />
    </div>
  );
}

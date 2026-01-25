import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Call Advantage" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Call Advantage"
        description="ポストフロップの局面で、コールすることによって得られるアドバンテージを学べます。"
        hidable
      />
      <Main />
    </>
  );
}

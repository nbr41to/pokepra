import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Full Street Defense" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Full Street Defense"
        description="BB DefenseとCall Advantageを組み合わせ、100BBスタートでフルストリートの防衛判断を鍛えます。"
        hidable
      />
      <Main />
    </>
  );
}

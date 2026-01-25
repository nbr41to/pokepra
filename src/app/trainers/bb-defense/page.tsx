import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export const metadata: Metadata = { title: "Preflop" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="BB Defense"
        description="BBのポジションではすでにブラインドを支払っている状態でプリフロップが始まります。このブラインドを守るための勝率を体感できる"
        hidable
      />
      <Main />
    </>
  );
}

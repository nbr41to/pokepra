import type { Metadata } from "next";
import { PageTitle } from "@/components/ui/page-title";
import Main from "./_components/main";

export const metadata: Metadata = { title: "Score Attack" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Full Street"
        description="PreflopからRiverまで自分のハンドの勝率の動向を確認することができます。"
        hidable
      />
      <Main />
    </>
  );
}

import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <>
      <PageTitle
        title="モンテカルロ法を体験する2"
        description="実際のポーカーの特定の状況での勝率の計算をモンテカルロ法で体験してみましょう。"
      />
      <Main />
    </>
  );
}

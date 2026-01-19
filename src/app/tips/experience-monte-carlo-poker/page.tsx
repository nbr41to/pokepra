import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="space-y-8 px-6 py-10">
      <HeaderTitle
        title="モンテカルロ法を体験する2"
        description="実際のポーカーの特定の状況での勝率の計算をモンテカルロ法で体験してみましょう。"
      />
      <Main />
    </div>
  );
}

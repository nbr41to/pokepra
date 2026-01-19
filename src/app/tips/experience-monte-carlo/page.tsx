import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function MonteCarloTipsPage() {
  return (
    <TipsPage>
      <HeaderTitle
        title="モンテカルロ法を体験する1"
        description="このアプリの心臓でもあるモンテカルロ法による確率の計算を体感してみましょう。"
      />
      <Main />
    </TipsPage>
  );
}

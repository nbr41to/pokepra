import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function MonteCarloTipsPage() {
  return (
    <>
      <PageTitle
        title="モンテカルロ法を体験する1"
        description="このアプリの心臓でもあるモンテカルロ法による確率の計算を体感してみましょう。"
      />
      <Main />
    </>
  );
}

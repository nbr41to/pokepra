import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export default function MonteCarloTipsPage() {
  return (
    <div className="space-y-4 px-6 py-10">
      <HeaderTitle
        title="モンテカルロ法を体験する1"
        description="このアプリの心臓でもあるモンテカルロ法による確率の計算を体感してみましょう。"
      />
      <Main />
    </div>
  );
}

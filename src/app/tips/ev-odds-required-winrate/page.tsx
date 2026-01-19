import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function EvOddsRequiredWinratePage() {
  return (
    <TipsPage>
      <HeaderTitle
        title="期待値 (EV)・オッズ・必要勝率の基本"
        description="ポットオッズから、コールに必要な勝率を素早く判断するための考え方。"
      />
      <Main />
    </TipsPage>
  );
}

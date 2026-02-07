import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function HandRankingPage() {
  return (
    <>
      <PageTitle
        title="役一覧とキッカー"
        description="テキサスホールデムの役の強さと、同じ役同士を比べるときのキッカー判定をまとめます。"
      />
      <Main />
    </>
  );
}

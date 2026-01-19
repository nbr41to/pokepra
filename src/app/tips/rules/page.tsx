import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function RulesPage() {
  return (
    <TipsPage>
      <HeaderTitle
        title="ポーカーのルールとポイント"
        description="初心者向けに、テキサスホールデムの基本を図と記号で整理します。"
      />
      <Main />
    </TipsPage>
  );
}

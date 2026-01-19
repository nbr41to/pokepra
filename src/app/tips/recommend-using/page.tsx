import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <TipsPage>
      <HeaderTitle
        title="おすすめの使い方"
        description="使うための準備や使い方を紹介します。"
      />
      <Main />
    </TipsPage>
  );
}

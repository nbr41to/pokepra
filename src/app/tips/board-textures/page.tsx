import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function BoardTypesPage() {
  return (
    <TipsPage>
      <HeaderTitle
        title="ボードの種類と特徴"
        description="フロップの質感によって、プレイの判断は大きく変わります。"
      />
      <Main />
    </TipsPage>
  );
}

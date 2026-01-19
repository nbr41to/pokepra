import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <TipsPage>
      <HeaderTitle title="スターティングハンドの勝率目安" />
      <Main />
    </TipsPage>
  );
}

import { HeaderTitle } from "@/components/header-title";
import { TipsPage } from "@/features/tips/tips-page";
import { Main } from "./_components/main";

export default function HandProbabilityPage() {
  return (
    <TipsPage>
      <HeaderTitle title="役が完成する確率" />
      <Main />
    </TipsPage>
  );
}

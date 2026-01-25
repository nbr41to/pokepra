import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function GtoNashEquilibriumPage() {
  return (
    <>
      <PageTitle
        title="GTO とナッシュ均衡を体感する"
        description="じゃんけんを 1000 回繰り返すと、均衡戦略がどう見えるかを観察します。"
      />
      <Main />
    </>
  );
}

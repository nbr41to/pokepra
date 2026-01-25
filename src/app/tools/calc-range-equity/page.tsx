import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <>
      <PageTitle
        title="Calculate Range Equity"
        description={"指定したボードに対してレンジ単位の勝率を計算します。"}
        hidable
      />
      <Main />
    </>
  );
}

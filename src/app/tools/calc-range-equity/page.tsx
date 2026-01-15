import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-y-3 px-6 py-12">
      <HeaderTitle
        title="Calculate Range Equity"
        description={"指定したボードに対してレンジ単位の勝率を計算します。"}
        hidable
      />
      <Main />
    </div>
  );
}

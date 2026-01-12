import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-y-3 px-6 py-12">
      <HeaderTitle
        title="Range Compare"
        description={"ボードに対して2つのレンジ内のハンドの勝率を比較します。"}
      />
      <Main />
    </div>
  );
}

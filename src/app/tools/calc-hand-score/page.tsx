import { Suspense } from "react";
import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-y-3 px-6 py-12">
      <HeaderTitle
        title="Calculate Hand Score"
        description="ボードとの相性の良いハンドのスコアを計算します。"
      />
      <Suspense>
        <Main />
      </Suspense>
    </div>
  );
}

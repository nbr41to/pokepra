import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between gap-y-3 px-2 pt-8">
      <HeaderTitle
        title="Preflop Stricter"
        description="設定されたレンジ表に従ってPreflopで参加するハンドの正誤を判定します。"
        hidable
      />
      <Main />
    </div>
  );
}

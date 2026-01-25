import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function Page() {
  return (
    <>
      <PageTitle
        title="Preflop Stricter"
        description="設定されたレンジ表に従ってPreflopで参加するハンドの正誤を判定します。"
        hidable
      />
      <Main />
    </>
  );
}

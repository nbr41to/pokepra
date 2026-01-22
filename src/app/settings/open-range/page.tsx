import { HeaderTitle } from "@/components/header-title";
import { Main } from "./_components/main";

const MAX_TABLES = 9;

export default function Page() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <HeaderTitle
        title="レンジ表の設定"
        description="フロップの質感によって、プレイの判断は大きく変わります。"
      />
      <Main maxTables={MAX_TABLES} />
    </div>
  );
}

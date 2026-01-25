import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

const MAX_TABLES = 9;

export default function Page() {
  return (
    <>
      <PageTitle
        title="レンジ表の設定"
        description="フロップの質感によって、プレイの判断は大きく変わります。"
        hidable
      />
      <Main maxTables={MAX_TABLES} />
    </>
  );
}

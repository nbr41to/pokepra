import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default async function Page() {
  return (
    <>
      <PageTitle
        title="Calculate Multi Equities"
        description={
          "マルチウェイの勝率を最大6人（自分対相手5人）まで求めることができます。（10000回試行）"
        }
        hidable
      />
      <Main />
    </>
  );
}

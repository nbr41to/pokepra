import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default function PotBetRatioRequiredWinratePage() {
  return (
    <>
      <PageTitle
        title="ポットに対するベット割合と必要勝率"
        description="ポットを 1 としたときのベット額と、コール側に必要な勝率をまとめます。"
      />
      <Main />
    </>
  );
}

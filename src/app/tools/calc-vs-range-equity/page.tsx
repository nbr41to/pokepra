import { PageTitle } from "@/components/ui/page-title";
import { Main } from "./_components/main";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    hero?: string;
    board?: string;
  }>;
}) {
  const { hero, board } = await searchParams;

  return (
    <>
      <PageTitle
        title="Calculate Equity"
        description={
          "自分のハンドと相手の考えうる複数のハンドとの勝率をそれぞれヘッズアップのシミュレーションします。\nまた、自分のレンジと相手のレンジの勝率を比較することもできます。\nMCPTの核となるシミュレーション機能であり、自分が相手のレンジに対してどれくらいの勝率を持っているか確認するのに役に立ちます。"
        }
        hidable
      />
      <Main
        hero={hero?.replaceAll(",", " ")}
        board={board?.replaceAll(",", " ")}
      />
    </>
  );
}

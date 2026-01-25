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
        title="Calculate Equities"
        description={
          "自分と相手（複数）の勝率をそれぞれヘッズアップのシミュレーションをして計算できます。\nMCPTの核となるシミュレーション機能であり、自分が相手のレンジに対してどれくらいの勝率を持っているか確認するのに役に立ちます。（試行回数1000回）\n※相手のハンドが複数のときは自分のハンド : 相手のハンド1、自分のハンド : 相手のハンド2、...という形でそれぞれの勝率が表示されます。自分のハンド : 相手のハンド1 : 相手のハンド2の複数人で対戦した場合の勝率ではないので注意してください。"
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

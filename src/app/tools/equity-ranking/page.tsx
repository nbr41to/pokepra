import { HeaderTitle } from "@/components/header-title";
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
  console.log(hero, board);

  return (
    <div className="flex w-full flex-col items-center gap-y-3 px-6 py-12">
      <HeaderTitle
        title="Calculate Equities"
        description={
          "自分対相手（複数）の勝率をシュミレーションできます。\n自分が相手のレンジに対してどれくらいの勝率を持っているか確認するのに役に立ちます。（試行回数1000回）"
        }
        hidable
      />
      <Main
        hero={hero?.replaceAll(",", " ")}
        board={board?.replaceAll(",", " ")}
      />
    </div>
  );
}

import Link from "next/link";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

export function TipsContent() {
  return (
    <TabsContent
      value="tips"
      className="flex w-full flex-col items-center gap-y-16"
    >
      <HeaderTitle
        title="Tips"
        description="便利なポーカー用ツールを集めました。"
      />

      <div className="flex flex-col items-center justify-center gap-y-3">
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/hand-probability">役が完成する確率</Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/starting-hand-winrate">
            スターティングハンドの勝率
          </Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/score-attack-scoring">
            スコアアタックの得点の計算方法
          </Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/monte-carlo">モンテカルロ法の体験</Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/bet-size">任意のポットに対するベットサイズ</Link>
        </Button>
        <Button className="w-60" variant="outline" size="lg" asChild>
          <Link href="/tips/flop-check">フロップでチェックする理由</Link>
        </Button>
      </div>
    </TabsContent>
  );
}

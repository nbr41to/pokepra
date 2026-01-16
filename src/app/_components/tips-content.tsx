import Link from "next/link";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { NavigationSection } from "./navigation-section";

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

      <NavigationSection title="Guide" description="はじめて使う方へ">
        <div className="flex flex-col items-center justify-center gap-y-3">
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/rules">ポーカーのルール説明</Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" disabled>
            <Link href="/tips/fans">ポーカーの楽しさ</Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/experience-monte-carlo">
              モンテカルロ法の体験1
            </Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/experience-monte-carlo-poker">
              モンテカルロ法を体験2
            </Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/recommend-using">アプリの簡単な使い方</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="Knowledge" description="用語・基本知識">
        <div className="flex flex-col items-center justify-center gap-y-3">
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/hand-probability">役が完成する確率</Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/starting-hand-equity">
              スターティングハンドの勝率
            </Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/hand-probability">役が完成する確率</Link>
          </Button>
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/board-textures">ボードの種類</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="Tips" description="役に立つ知識集">
        <div className="flex flex-col items-center justify-center gap-y-3">
          <Button className="w-60" variant="outline" size="lg" asChild>
            <Link href="/tips/flop-check">フロップでチェックする理由</Link>
          </Button>
        </div>
      </NavigationSection>
    </TabsContent>
  );
}

import {
  Calculator,
  ChartSpline,
  Coins,
  Diamond,
  Grid3X3,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { NavigationSection } from "./navigation-section";
import { RichLinkCard } from "./rich-link-card";

export function ToolsContent() {
  return (
    <TabsContent value="tools" className="flex w-full flex-col items-center">
      <Calculator
        size={240}
        className="fixed top-4 left-0 -z-10 -rotate-12 text-muted-foreground brightness-200 dark:brightness-20"
      />
      <Diamond
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed bottom-20 left-2/5 -z-20 rotate-12 text-orange-400 dark:text-orange-950"
      />
      <HeaderTitle
        title="Tools"
        description="便利なポーカー用ツールを集めました。"
      />

      <div className="w-full space-y-3 px-2 py-8">
        <RichLinkCard
          href="/tools/calc-equities"
          title="Calculate Equities"
          description="指定したハンドとボードに対する勝率を計算します。"
          icon={<Percent />}
        />
        <RichLinkCard
          href="/tools/calc-range-equity"
          title="Range Equity"
          description="指定したボードに対してレンジ単位の勝率を計算します。"
          icon={<Grid3X3 />}
        />
        <RichLinkCard
          href="/tools/analytics"
          title="Analytics"
          description="分析のオールインワンツールです。"
          icon={<ChartSpline />}
        />
        <RichLinkCard
          href="/tools/calc-bet-size"
          title="Bet Size"
          description="任意のポットに対するベットサイズと必要勝率の計算。"
          icon={<Coins />}
        />
      </div>

      <Separator />

      <NavigationSection title="Experimental" description="開発中・試作">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tools/calc-hand-score">Hand Score</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tools/range-setting">Range Setting</Link>
          </Button>
        </div>
      </NavigationSection>
    </TabsContent>
  );
}

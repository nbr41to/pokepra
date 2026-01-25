import {
  Calculator,
  ChartSpline,
  Coins,
  Diamond,
  Percent,
  UsersRound,
} from "lucide-react";
import { TabsContent } from "@/components/shadcn/tabs";
import { PageTitle } from "@/components/ui/page-title";
import { RichLinkCard } from "../rich-link-card";

export function ToolsContent() {
  return (
    <TabsContent value="tools" className="flex w-full flex-col items-center">
      <Calculator
        size={160}
        className="fixed top-4 left-0 -z-10 -rotate-12 text-muted-foreground brightness-200 dark:brightness-20"
      />
      <Diamond
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed bottom-20 left-2/5 -z-20 rotate-12 text-orange-400 dark:text-orange-950"
      />
      <PageTitle
        title="Tools"
        description="便利なポーカー用ツールを集めました。"
      />

      <div className="w-full space-y-3 px-2 py-8">
        <RichLinkCard
          href="/tools/analytics"
          title="Analytics"
          description="分析のオールインワンツールです。"
          icon={<ChartSpline />}
        />
        <RichLinkCard
          href="/tools/calc-vs-range-equity"
          title="Calculate Equity"
          description="あなたのハンド・レンジと相手1人のレンジに対する分析ができます。"
          icon={<Percent />}
        />
        <RichLinkCard
          href="/tools/calc-multi-equities"
          title="Calculate Multi Equity"
          description="あなたのハンドと相手複数人のハンドに対する勝率を計算できます。"
          icon={<UsersRound />}
        />
        <RichLinkCard
          href="/tools/calc-bet-size"
          title="Bet Size"
          description="任意のポットに対するベットサイズと必要勝率の計算。"
          icon={<Coins />}
        />
      </div>

      {/* <Separator className="my-12" />
      <NavigationSection title="Experimental" description="開発中・試作">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3"></div>
      </NavigationSection> */}
    </TabsContent>
  );
}

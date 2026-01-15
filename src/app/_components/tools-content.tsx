import Link from "next/link";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { LinkCard } from "./link-card";
import { NavigationSection } from "./navigation-section";

export function ToolsContent() {
  return (
    <TabsContent
      value="tools"
      className="flex w-full flex-col items-center gap-y-16"
    >
      <HeaderTitle
        title="Tools"
        description="便利なポーカー用ツールを集めました。"
      />

      <div className="grid w-full grid-cols-2 gap-4 px-2">
        <LinkCard
          href="/tools/calc-equities"
          title="Calculate Equities"
          description="指定したハンドとボードに対する勝率を計算します。"
        />
        <LinkCard
          href="/tools/calc-range-equity"
          title="Range Equity"
          description="指定したボードに対してレンジ単位の勝率を計算します。"
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

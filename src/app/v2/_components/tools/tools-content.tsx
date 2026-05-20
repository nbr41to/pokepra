import { Calculator, ChartSpline, Diamond } from "lucide-react";
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
        className="fixed right-0 bottom-20 -z-20 translate-x-1/5 rotate-12 text-suit-diamond"
      />
      <PageTitle
        title="Tools"
        description="便利なポーカー用ツールを集めました。"
      />

      <div className="w-full space-y-3 px-2 py-8">
        <RichLinkCard
          href="/v2/tools/street-simulation"
          title="Street Simulation"
          description="フロップ以降のシミュレーションツール。"
          icon={<ChartSpline />}
        />
      </div>

      {/* <Separator className="my-12" />
      <NavigationSection title="Experimental" description="開発中・試作">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3"></div>
      </NavigationSection> */}
    </TabsContent>
  );
}

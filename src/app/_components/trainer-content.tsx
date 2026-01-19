import Link from "next/link";
import { HeaderTitle } from "@/components/header-title";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { LinkCard } from "./link-card";
import { NavigationSection } from "./navigation-section";

export function TrainerContent() {
  return (
    <TabsContent
      value="trainer"
      className="flex w-full flex-col items-center gap-y-16"
    >
      <HeaderTitle
        title="Trainer"
        description="ゲーム中の確率を体感することができます。"
      />

      <div className="grid w-full grid-cols-2 gap-4 px-2">
        <LinkCard
          href="/trainers/preflop-equity"
          title="Preflop Equity"
          description="プリフロップで参加するハンドの勝率を体感できます。"
        />
        <LinkCard
          href="/trainers/full-street"
          title="Full Street"
          description="様々なシチュエーションにおける勝率を体感できます。"
        />
        <LinkCard
          href="/trainers/bb-defense"
          title="BB Defense"
          description="BBでのディフェンスを体感できます。"
        />
        <LinkCard
          href="/trainers/equity-quiz"
          title="Equity Quiz"
          description="フロップにおける勝率のクイズができます。"
        />
      </div>

      <Separator />

      <NavigationSection title="Experimental" description="開発中・試作">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/postflop">Postflop</Link>
          </Button>
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/score-attack">Score Attack</Link>
          </Button>
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/equity-story">Story Report</Link>
          </Button>
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/open-raise-vs-bb">Open Raise vs BB</Link>
          </Button>
        </div>
      </NavigationSection>
    </TabsContent>
  );
}

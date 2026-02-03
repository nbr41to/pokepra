import {
  BookCheck,
  CheckCircle,
  ChessKnight,
  ChessRook,
  ChevronRight,
  CircleStar,
  CircleX,
  Gamepad2,
  Grid3X3,
  MessageCircleQuestion,
  Percent,
  ShieldPlus,
  Spade,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { Combo } from "@/components/combo";
import { PlayCard } from "@/components/play-card";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import { TabsContent } from "@/components/shadcn/tabs";
import { PageTitle } from "@/components/ui/page-title";
import { NavigationSection } from "../navigation-section";
import { RichLinkCard } from "../rich-link-card";

export function TrainersContent() {
  return (
    <TabsContent value="trainers" className="flex w-full flex-col items-center">
      <Gamepad2
        size={160}
        className="fixed -top-2 left-0 -z-10 -rotate-12 text-muted-foreground brightness-200 dark:brightness-20"
      />
      <Spade
        size={320}
        fill="currentColor"
        strokeWidth={3}
        className="fixed right-0 bottom-20 -z-20 translate-x-1/5 rotate-12 text-blue-400 dark:text-blue-950"
      />
      <PageTitle
        title="Trainers"
        description="ゲームを通して確率を体感することができます。"
      />

      <div className="w-full space-y-3 px-2 py-8">
        <RichLinkCard
          href="/trainers/preflop-equity"
          title="Preflop Equity"
          description="プリフロップで参加するハンドの勝率を体感できます。"
          icon={<Swords />}
        >
          <div className="flex items-center justify-center text-suit-spade">
            <Combo className="origin-bottom scale-70" hand={["Js", "9s"]} />
            <MessageCircleQuestion className="mt-2" size={20} />
            <Percent className="mt-4 ml-1" size={12} />
          </div>
        </RichLinkCard>
        <RichLinkCard
          href="/trainers/preflop-stricter"
          title="Preflop Stricter"
          description="プリフロップのオープンレンジをより厳格に覚えることができます。"
          icon={<Grid3X3 />}
        >
          <div className="flex items-center justify-center gap-x-2">
            <Grid3X3 size={24} />
            <ChevronRight size={16} className="" />
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-sm">or</span>
            <CircleX className="text-red-500" size={20} />
          </div>
        </RichLinkCard>
        <RichLinkCard
          href="/trainers/bet-advantage"
          title="Bet Advantage"
          description="ポジションがあるときの期待値の高くなるベット額を鍛えます。"
          isNew
          icon={<ChessKnight />}
        />
        <RichLinkCard
          href="/trainers/call-advantage"
          title="Call Advantage"
          description="勝率に応じたCallの判断を鍛えます。"
          isNew
          icon={<ChessRook />}
        />
        <RichLinkCard
          href="/trainers/bb-defense"
          title="BB Defense"
          description="BBでのディフェンスを体感できます。"
          icon={<ShieldPlus />}
        >
          <div className="flex items-center justify-center text-suit-diamond">
            <Combo className="origin-bottom scale-70" hand={["3d", "2d"]} />
            <MessageCircleQuestion className="mt-2" size={20} />
            <Percent className="mt-4 ml-1" size={12} />
          </div>
        </RichLinkCard>
        <RichLinkCard
          href="/trainers/full-street"
          title="Full Street"
          description="様々なシチュエーションにおける勝率を体感できます。"
          icon={<CircleStar />}
        >
          <div className="flex justify-center">
            {["Ah", "Kh", "7c", "Ts", "3h"].map((rs) => (
              <PlayCard
                key={rs}
                rs={rs}
                size="sm"
                className="origin-bottom scale-75"
              />
            ))}
          </div>
        </RichLinkCard>
        <RichLinkCard
          href="/trainers/equity-quiz"
          title="Equity Quiz"
          description="フロップにおける勝率のクイズができます。"
          icon={<BookCheck />}
        />
        <RichLinkCard
          href="/trainers/turn-equity-quiz"
          title="Turn Equity Quiz"
          description="ターンにおける勝率のクイズができます。"
          icon={<BookCheck />}
        />
      </div>

      <Separator className="my-12" />

      <NavigationSection title="Experimental" description="開発中・試作">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/trainers/postflop">Postflop</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/trainers/score-attack">Score Attack</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/trainers/open-raise-vs-bb">Open Raise vs BB</Link>
          </Button>
        </div>
      </NavigationSection>
    </TabsContent>
  );
}

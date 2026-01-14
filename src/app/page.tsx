import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CatchAccordion } from "./_components/catch-accordion";
import { NavigationSection } from "./_components/navigation-section";
import { RestoreHomeScroll } from "./_components/restore-home-scroll";
import { SwitchSuitIcon } from "./_components/switch-suit-icon";

export default function Page() {
  return (
    <div
      id="home-scroll-container"
      className="flex h-dvh w-full flex-col items-center gap-y-16 overflow-scroll px-2 py-8"
    >
      <RestoreHomeScroll />
      <div className="-mb-6 space-y-2">
        <div className="mx-auto w-fit rounded-[22px] bg-[conic-gradient(at_50%_50%,#fb923c_0deg,#4ade80_90deg,#60a5fa_180deg,#f472b6_270deg,#fb923c_360deg)] p-1.5 dark:bg-[conic-gradient(at_50%_50%,#ea580c_0deg,#16a34a_90deg,#2563eb_180deg,#db2777_270deg,#ea580c_360deg)]">
          <Image
            className="rounded-[16px] bg-white"
            src="/apple-touch-icon.png"
            alt="MCPT Logo"
            width={120}
            height={120}
            priority
            unoptimized
          />
        </div>
        <div className="flex items-center justify-center gap-x-3 pt-4">
          <SwitchSuitIcon suit="s" />
          <h1 className="text-center font-bold font-montserrat text-2xl">
            <span className="text-orange-400 dark:text-orange-600">M</span>
            onte <span className="text-green-400 dark:text-green-600">C</span>
            arlo
            <br />
            <span className="text-blue-400 dark:text-blue-600">P</span>
            oker <span className="text-pink-400 dark:text-pink-600">T</span>
            rainer
          </h1>
          <SwitchSuitIcon suit="h" />
        </div>
        <p className="text-center font-bold text-sm">
          初心者と感覚派のための
          <br />
          楽しいポーカートレーナー
        </p>

        <p className="text-right font-bold font-noto-sans-jp text-xl">
          ベータ版
        </p>
      </div>

      <CatchAccordion />

      <NavigationSection title="Trainers" description="練習用GAME">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/preflop">Preflop</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/trainers/postflop">Postflop</Link>
          </Button>
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/score-attack">Score Attack</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/trainers/full-street">Full Street</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/trainers/bb-defense">BB Defense</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection
        title="Simulator"
        description="特定の状況における統計解析"
      >
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tools/equity-ranking">EQ Ranking</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tools/calc-hand-score">Hand Score</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tools/range-compare">Range Compare</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tools/range-setting">Range Setting</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="Tips" description="アプリの説明">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="default" size="lg" disabled>
            <Link href="/preflop">このアプリについて</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" asChild>
            <Link href="/tips">Tips</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="Experimental" description="試験運用中のもの">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="default" size="lg" asChild>
            <Link href="/trainers/open-raise-vs-bb">Open Raise vs BB</Link>
          </Button>
          <Button className="w-full" variant="default" size="lg" disabled>
            <Link href="/trainers/range-bet">Range Bet</Link>
          </Button>
        </div>
      </NavigationSection>

      <NavigationSection title="Terms" description="規約">
        <div className="flex w-60 flex-col items-center justify-center gap-y-3">
          <Button className="w-full" variant="outline" size="lg" disabled>
            <Link href="/terms">利用規約</Link>
          </Button>
          <Button className="w-full" variant="outline" size="lg" disabled>
            <Link href="/terms">特商法</Link>
          </Button>
        </div>
      </NavigationSection>

      <footer className="flex w-61 items-center justify-between gap-x-3">
        <SwitchSuitIcon suit="c" />
        <small className="font-bold">MCPT</small>
        <SwitchSuitIcon suit="d" />
      </footer>
    </div>
  );
}

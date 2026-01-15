import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatchAccordion } from "./catch-accordion";
import { NavigationSection } from "./navigation-section";
import { SuitConfettiOverlay } from "./suit-confetti-overlay";
import { SwitchSuitIcon } from "./switch-suit-icon";

export function IntroductionContent() {
  return (
    <TabsContent
      value="introduction"
      className="relative z-10 flex w-full flex-col items-center gap-y-16"
    >
      <SuitConfettiOverlay />
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
            <span className="text-suit-diamond">M</span>
            onte <span className="text-suit-club">C</span>
            arlo
            <br />
            <span className="text-suit-spade">P</span>
            oker <span className="text-suit-heart">T</span>
            rainer
          </h1>
          <SwitchSuitIcon suit="h" />
        </div>

        <p className="text-center font-bold text-sm">
          初心者と感覚派のための
          <br />
          楽しいポーカートレーナー
        </p>

        <p className="text-right font-bold text-xl">ベータ版</p>
      </div>

      <section className="relative w-full max-w-md px-4">
        <div className="pointer-events-none absolute -inset-3 rounded-[32px] bg-[radial-gradient(circle_at_top,#38bdf8_0%,transparent_55%),radial-gradient(circle_at_30%_90%,#f472b6_0%,transparent_60%)] opacity-70 blur-2xl" />
        <div className="relative rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.6)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <p className="font-montserrat text-[0.6rem] text-slate-500 uppercase tracking-[0.35em] dark:text-slate-300">
            Concept
          </p>
          <h2 className="mt-3 text-2xl text-slate-900 dark:text-slate-100">
            モンテカルロで学ぶ、
            <br />
            体感型GTOトレーナー
          </h2>
          <p className="mt-3 font-noto-sans-jp text-slate-600 text-sm dark:text-slate-200">
            何度も回して統計を可視化。フィードバックをその場で受け取り、
            スポット別に「強さの感覚」を育てます。
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700 text-xs dark:bg-white/10 dark:text-slate-100">
              <span className="font-semibold text-suit-spade">Monte Carlo</span>{" "}
              でアクションの妥当性を即フィードバック
            </div>
            <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700 text-xs dark:bg-white/10 dark:text-slate-100">
              スポット特化のミニゲームで状況別に反復練習
            </div>
            <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700 text-xs dark:bg-white/10 dark:text-slate-100">
              勝率が計算できる複数のツールが使える
            </div>
            <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700 text-xs dark:bg-white/10 dark:text-slate-100">
              むずかしいゲーム理論の話、
              <span className="font-semibold text-suit-heart">GTO</span>{" "}
              を体で覚える設計で初心者にもやさしい
            </div>
            <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700 text-xs dark:bg-white/10 dark:text-slate-100">
              ブラウザで完結、ダウンロード不要
            </div>
          </div>

          <div className="mt-5 rounded-full bg-[conic-gradient(at_50%_50%,#fb923c_0deg,#4ade80_90deg,#60a5fa_180deg,#f472b6_270deg,#fb923c_360deg)] p-[2px] dark:bg-[conic-gradient(at_50%_50%,#ea580c_0deg,#16a34a_90deg,#2563eb_180deg,#db2777_270deg,#ea580c_360deg)]">
            <Button
              className="h-12 w-full rounded-full border-none font-bold text-base"
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="/tips/experience-monte-carlo-poker">
                モンテカルロポーカーを体験する
              </Link>
            </Button>
          </div>

          <TabsList className="mt-6 grid h-auto w-full grid-cols-2 gap-3 bg-transparent p-0">
            <TabsTrigger
              value="trainer"
              className="h-12 rounded-full bg-slate-900 text-sm text-white shadow-lg shadow-slate-900/20 transition data-[state=active]:bg-slate-900 dark:bg-white dark:text-slate-900"
            >
              Trainer
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="h-12 rounded-full border border-slate-300 bg-white text-slate-700 text-sm shadow-sm transition data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 dark:border-white/30 dark:bg-slate-900 dark:text-slate-100 dark:data-[state=active]:border-white"
            >
              Tools
            </TabsTrigger>
          </TabsList>
        </div>
      </section>

      <CatchAccordion />

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
    </TabsContent>
  );
}

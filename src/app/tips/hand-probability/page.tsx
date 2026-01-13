import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HandProbabilityPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-bold font-montserrat text-2xl">役が完成する確率</h1>
        <Button variant="ghost" asChild>
          <Link href="/tips">← Tips 一覧へ</Link>
        </Button>
      </header>
      <section className="space-y-4">
        <p className="text-muted-foreground text-sm">
          フロップ以降に特定の役を完成させるおおまかな確率のメモです。
          実戦ではアウト数を数えて「ターン・リバーで届くか」を目安にしてください。
        </p>
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">代表的なアウト数と確率</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>4 枚ストレート (8 outs): ターン+リバーで約 31.5%</li>
            <li>フラッシュドロー (9 outs): ターン+リバーで約 35%</li>
            <li>2 オーバーカード (6 outs): ターン+リバーで約 24%</li>
            <li>セット→フルハウス/クアッズ (7 outs): ターン+リバーで約 30%</li>
            <li>ガットショット (4 outs): ターン+リバーで約 16.5%</li>
          </ul>
        </div>
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">ワンカードでの目安</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>9 outs: 1 枚で約 19.6%</li>
            <li>8 outs: 1 枚で約 17.4%</li>
            <li>6 outs: 1 枚で約 13.0%</li>
            <li>4 outs: 1 枚で約 8.7%</li>
            <li>2 outs: 1 枚で約 4.3%</li>
          </ul>
          <p className="text-muted-foreground text-xs">
            4/2 ルールの目安: アウト数 × 4 ≒ ターン+リバー、アウト数 × 2 ≒ 1
            枚で引く確率。
          </p>
        </div>
      </section>
    </div>
  );
}

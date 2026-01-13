import Link from "next/link";
import { Button } from "@/components/ui/button";
import preflopHandRanking from "@/data/preflop-hand-ranking.json";

export default function StartingHandWinratePage() {
  const topHands = preflopHandRanking.slice(0, 30); // 上位 30 を表示

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-bold font-montserrat text-2xl">
          スターティングハンドの勝率目安
        </h1>
        <Button variant="ghost" asChild>
          <Link href="/tips">← Tips 一覧へ</Link>
        </Button>
      </header>
      <section className="space-y-4">
        <p className="text-muted-foreground text-sm">
          preflop-hand-ranking.json を元にしたプリフロップ勝率の上位抜粋。 2 人
          (HU)、6-max、フルリングの勝率を確認できます。
        </p>
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">勝率テーブル (上位 30)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="py-2 pr-3">Rank</th>
                  <th className="py-2 pr-3">Hand</th>
                  <th className="py-2 pr-3">HU</th>
                  <th className="py-2 pr-3">6-max</th>
                  <th className="py-2 pr-3">Full ring</th>
                </tr>
              </thead>
              <tbody>
                {topHands.map((row) => (
                  <tr key={row.hand} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-mono text-xs">{row.rank}</td>
                    <td className="py-2 pr-3 font-semibold">{row.hand}</td>
                    <td className="py-2 pr-3">{row.player2}%</td>
                    <td className="py-2 pr-3">{row.player6}%</td>
                    <td className="py-2 pr-3">{row.player10}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground text-xs">
            データソース: src/data/preflop-hand-ranking.json。 スーツは
            s=スーテッド, o=オフスート。必要に応じて全件を参照してください。
          </p>
        </div>
      </section>
    </div>
  );
}

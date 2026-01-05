import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ScoreAttackScoringPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-bold font-montserrat text-2xl">
          スコアアタックの得点計算
        </h1>
        <Button variant="ghost" asChild>
          <Link href="/tips">← Tips 一覧へ</Link>
        </Button>
      </header>
      <section className="space-y-4">
        <p className="text-muted-foreground text-sm">
          getPokerRanking（スコアアタックの内部計算）をベースにした、ハンドの評価方法メモ。
        </p>
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">計算フロー</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>
              ITERATE_COUNT=1000
              でボード+ハンドのシミュレーションを走らせ、各役カテゴリの発生確率を取得。
            </li>
            <li>
              スターティングハンド表 (preflop-hand-ranking.json)
              からそのハンドのエクイティを参照し、同役内のキッカー強さの代理値にする。
            </li>
            <li>
              役カテゴリの強さ（High〜StraightFlush を 0..1
              で正規化）、キッカー代理値、役の希少度（実測確率とベースライン確率の対数比）の3つを合成。
            </li>
            <li>
              各役の「価値 × 発生確率」を合算し、10 で割った値を score
              として保存。
            </li>
          </ol>
          <p className="text-muted-foreground text-xs">
            係数は ALPHA_EQUITY=0.35（キッカー寄与）と
            BETA_RARITY=0.12（希少度補正）。
            ベースライン確率は役ごとに固定し、希少な役ほど log
            比でわずかに上乗せします。
          </p>
        </div>
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">スコアの読み方</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>score が高いほど「そのボード・ハンドで価値が出やすい」</li>
            <li>同じ役カテゴリなら preflop エクイティが高い方が優先される</li>
            <li>極端に出にくい役を作った場合は希少度ボーナスがわずかに乗る</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

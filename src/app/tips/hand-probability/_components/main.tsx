import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

export const Main = () => {
  return (
    <section className="space-y-4">
      <TipsText>
        フロップ以降に特定の役を完成させるおおまかな確率のメモです。
        実戦ではアウト数を数えて「ターン・リバーで届くか」を目安にしてください。
      </TipsText>
      <TipsCard size="sm" className="space-y-3">
        <h2 className="font-semibold">
          7枚見たときの役の完成確率（初心者向け）
        </h2>
        <p className="text-muted-foreground text-xs">
          ホール2枚＋ボード5枚の7枚から、最終的にできる役の確率の目安です。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>ハイカード: 約 17.4%</li>
          <li>ワンペア: 約 43.8%</li>
          <li>ツーペア: 約 23.5%</li>
          <li>スリーカード: 約 4.83%</li>
          <li>ストレート: 約 4.62%</li>
          <li>フラッシュ: 約 3.03%</li>
          <li>フルハウス: 約 2.60%</li>
          <li>フォーカード: 約 0.168%</li>
          <li>ストレートフラッシュ: 約 0.031%</li>
        </ul>
      </TipsCard>
      <TipsCard size="sm" className="space-y-3">
        <h2 className="font-semibold">代表的なアウト数と確率</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>4 枚ストレート (8 outs): ターン+リバーで約 31.5%</li>
          <li>フラッシュドロー (9 outs): ターン+リバーで約 35%</li>
          <li>2 オーバーカード (6 outs): ターン+リバーで約 24%</li>
          <li>セット→フルハウス/クアッズ (7 outs): ターン+リバーで約 30%</li>
          <li>ガットショット (4 outs): ターン+リバーで約 16.5%</li>
        </ul>
      </TipsCard>
      <TipsCard size="sm" className="space-y-3">
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
      </TipsCard>
    </section>
  );
};

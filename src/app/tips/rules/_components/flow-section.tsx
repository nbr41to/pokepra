import { TipsCard } from "@/features/tips/tips-card";

export function FlowSection() {
  return (
    <TipsCard asChild size="sm" className="space-y-2">
      <section>
        <h2 className="font-semibold">ゲームの流れ</h2>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground text-sm">
          <li>2枚のハンドを確認</li>
          <li>参加するか降りるか決める (プリフロップ)</li>
          <li>共通カード3枚が開く (フロップ)</li>
          <li>参加者同士でアクション (フロップのベット)</li>
          <li>4枚目が開く (ターン)</li>
          <li>参加者同士でアクション (ターンのベット)</li>
          <li>5枚目が開く (リバー)</li>
          <li>最後まで残った人で役の強さを比較</li>
        </ol>
      </section>
    </TipsCard>
  );
}

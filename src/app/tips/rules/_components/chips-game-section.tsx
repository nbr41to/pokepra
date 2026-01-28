import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

export function ChipsGameSection() {
  return (
    <TipsCard asChild className="space-y-2">
      <section>
        <h2 className="font-semibold">チップを奪い合うゲーム</h2>
        <TipsText>
          役の競い合いを何度も繰り返し、より多くのチップを獲得することが目的です。
          勝負に参加するか降りるかの判断が重要になります。
        </TipsText>
      </section>
    </TipsCard>
  );
}

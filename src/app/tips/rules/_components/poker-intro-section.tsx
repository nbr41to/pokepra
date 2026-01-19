import { PlayCard } from "@/components/play-card";
import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

export function PokerIntroSection() {
  return (
    <TipsCard asChild size="sm" className="space-y-2">
      <section>
        <h2 className="font-semibold">ポーカーとは</h2>
        <TipsText>
          5枚のカードで「役」を作り、役の強さで勝負するゲームです。
          強い役を作った人がポット(賭けられたチップ)を獲得します。
        </TipsText>
        <div className="space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
          <p className="font-semibold">役の例</p>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-muted-foreground text-xs">
                ツーペア
              </span>
              {["Ah", "Ad", "Ks", "Kc", "7d"].map((card) => (
                <PlayCard key={`two-pair-${card}`} rs={card} size="sm" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-muted-foreground text-xs">
                ストレート
              </span>
              {["9s", "Td", "Jh", "Qc", "Kd"].map((card) => (
                <PlayCard key={`straight-${card}`} rs={card} size="sm" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-muted-foreground text-xs">
                フラッシュ
              </span>
              {["Ah", "Qh", "9h", "5h", "2h"].map((card) => (
                <PlayCard key={`flush-${card}`} rs={card} size="sm" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-muted-foreground text-xs">
                フルハウス
              </span>
              {["Qs", "Qd", "Qh", "7c", "7s"].map((card) => (
                <PlayCard key={`full-house-${card}`} rs={card} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </TipsCard>
  );
}

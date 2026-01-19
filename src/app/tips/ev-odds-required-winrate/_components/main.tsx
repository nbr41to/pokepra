import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

const exampleRows = [
  {
    label: "ポット 100 / コール 50",
    pot: 100,
    call: 50,
    odds: "1 : 2",
    required: "33.3%",
  },
  {
    label: "ポット 300 / コール 100",
    pot: 300,
    call: 100,
    odds: "1 : 3",
    required: "25.0%",
  },
  {
    label: "ポット 240 / コール 160",
    pot: 240,
    call: 160,
    odds: "2 : 3",
    required: "40.0%",
  },
];

export const Main = () => {
  return (
    <>
      <section className="space-y-3">
        <TipsText>
          ポーカーでは「今このコールは得なのか？」を判断するのが重要です。
          その基準になるのが期待値 (EV)・ポットオッズ・必要勝率です。
        </TipsText>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <TipsCard className="space-y-3">
          <h2 className="font-semibold">期待値 (EV)</h2>
          <TipsText>長期的に平均でどれだけ得をするかを示す数値です。</TipsText>
          <div className="rounded-md bg-muted/60 p-3 text-muted-foreground text-xs">
            EV = (勝率 × 得られる額) - (負け率 × 支払う額)
          </div>
          <p className="text-muted-foreground text-xs">
            EV がプラスなら長期的に得、マイナスなら損になります。
          </p>
        </TipsCard>

        <TipsCard className="space-y-3">
          <h2 className="font-semibold">ポットオッズ</h2>
          <TipsText>
            「払う額」に対して「勝てた時に得られる額」がどれだけあるかを比率で見る考え方です。
          </TipsText>
          <div className="rounded-md bg-muted/60 p-3 text-muted-foreground text-xs">
            オッズ = コール額 : (ポット + コール額)
          </div>
          <p className="text-muted-foreground text-xs">
            オッズが有利なほど、低い勝率でもコールできます。
          </p>
        </TipsCard>

        <TipsCard className="space-y-3">
          <h2 className="font-semibold">必要勝率</h2>
          <TipsText>
            コールがプラス EV になるために最低限必要な勝率です。
          </TipsText>
          <div className="rounded-md bg-muted/60 p-3 text-muted-foreground text-xs">
            必要勝率 = コール額 ÷ (ポット + コール額)
          </div>
          <p className="text-muted-foreground text-xs">
            推定勝率が必要勝率を上回ればコールが正当化されます。
          </p>
        </TipsCard>
      </section>

      <TipsCard asChild className="space-y-4">
        <section>
          <div>
            <h2 className="font-semibold">よくある例</h2>
            <p className="text-muted-foreground text-xs">
              ポットサイズとコール額から、必要勝率を素早く判断します。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {exampleRows.map((row) => (
              <div
                key={row.label}
                className="rounded-md border bg-muted/40 p-4 text-sm"
              >
                <p className="font-semibold">{row.label}</p>
                <p className="mt-2 text-muted-foreground text-xs">
                  オッズ: <span className="font-semibold">{row.odds}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  必要勝率:{" "}
                  <span className="font-semibold">{row.required}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </TipsCard>

      <section className="grid gap-4 md:grid-cols-2">
        <TipsCard className="space-y-3 text-muted-foreground text-sm">
          <h2 className="font-semibold text-foreground">実戦での使い方</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>まずポットとコール額を確認する</li>
            <li>必要勝率を計算して自分の勝率予想と比べる</li>
            <li>足りない場合はフォールドして損失を抑える</li>
          </ul>
        </TipsCard>
        <TipsCard className="space-y-3 bg-amber-50/80 text-amber-900 text-sm shadow-none">
          <h2 className="font-semibold">注意ポイント</h2>
          <p>
            実際の勝率は「相手のレンジ」「ボード」「ポジション」で変わります。
            必要勝率は目安として使い、根拠のある推定と組み合わせましょう。
          </p>
        </TipsCard>
      </section>
    </>
  );
};

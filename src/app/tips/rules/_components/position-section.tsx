import { TipsCard } from "@/features/tips/tips-card";
import { TipsText } from "@/features/tips/tips-text";

export function PositionSection() {
  return (
    <TipsCard asChild className="space-y-2">
      <section>
        <h2 className="font-semibold">アクションの順番とポジション</h2>
        <TipsText>
          ベッティングラウンドでアクションを行う順番は、ディーラーが目印のために使用するディーラーボタン（DEALER
          BUTTON）の位置から時計回りとなります。このディーラーボタンの位置のポジションはボタン（BTN）と呼ばれ、順番が最後となります。他のプレイヤーの様子を伺ってから意思決定できるポジションであるため有利とされています。
        </TipsText>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">
          SB → BB → BBの次の人（UTGという）→ … → BTN
        </div>
        <TipsText>
          最初のBetting
          Roundにおいて、最初の人とその次の人が強制でチップを賭けるというルールがあるため、順にSB（スモールブラインド）、BB（ビックブラインド）と呼ばれます。（Blindとは最初に支払うチップを指します）
        </TipsText>
        <TipsText>
          まずはこの3つのポジションの名前だけでも覚えておくと良いでしょう。
        </TipsText>
        <TipsText>
          順番に関してややこしいポイントは、先程述べた「最初のBetting
          Roundにおいて、最初の人とその次の人が強制でBLINDをBETするというルール」のために順番が前後することです。
        </TipsText>
        <TipsText>
          最初のBetting
          Roundにおいては最初のアクションはBBの次の人（UTGという）になります。強制でBLINDをBETしたSBとBBのアクションは最後であるBTNの後に周ります。ただし、このときにすでに賭けたチップを取り戻すことはできません。
        </TipsText>
        <TipsText>
          その後に参加者が2名以上となり共通カードが3枚開いて以降から最初に述べた順番どおりとなります。
        </TipsText>
        <TipsText>
          つまり、基本の順番は「SB → BB → … →
          BTN」であるが、一番最初だけSBとBBが最後に周されると覚えておくと良いでしょう。
        </TipsText>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">
          まとめ
          <br />
          <br />
          Preflop
          <br />
          <br />
          SBとBBが強制BET（アクションは不可） → UTG → … → BTN → SB → BB
          <br />
          <br />
          Preflop後から
          <br />
          <br />
          SB → BB → UTG → … → BTN
        </div>
      </section>
    </TipsCard>
  );
}

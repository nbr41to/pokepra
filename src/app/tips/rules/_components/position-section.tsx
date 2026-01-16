export function PositionSection() {
  return (
    <section className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
      <h2 className="font-semibold">アクションの順番とポジション</h2>
      <p className="text-muted-foreground text-sm">
        ベッティングラウンドでアクションを行う順番は、ディーラーが目印のために使用するディーラーボタン（DEALER
        BUTTON）の位置から時計回りとなります。このディーラーボタンの位置のポジションはボタン（BTN）と呼ばれ、順番が最後となります。他のプレイヤーの様子を伺ってから意思決定できるポジションであるため有利とされています。
      </p>
      <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed">
        SB → BB → BBの次の人（UTGという）→ … → BTN
      </div>
      <p className="text-muted-foreground text-sm">
        最初のBetting
        Roundにおいて、最初の人とその次の人が強制でチップを賭けるというルールがあるため、順にSB（スモールブラインド）、BB（ビックブラインド）と呼ばれます。（Blindとは最初に支払うチップを指します）
      </p>
      <p className="text-muted-foreground text-sm">
        まずはこの3つのポジションの名前だけでも覚えておくと良いでしょう。
      </p>
      <p className="text-muted-foreground text-sm">
        順番に関してややこしいポイントは、先程述べた「最初のBetting
        Roundにおいて、最初の人とその次の人が強制でBLINDをBETするというルール」のために順番が前後することです。
      </p>
      <p className="text-muted-foreground text-sm">
        最初のBetting
        Roundにおいては最初のアクションはBBの次の人（UTGという）になります。強制でBLINDをBETしたSBとBBのアクションは最後であるBTNの後に周ります。ただし、このときにすでに賭けたチップを取り戻すことはできません。
      </p>
      <p className="text-muted-foreground text-sm">
        その後に参加者が2名以上となり共通カードが3枚開いて以降から最初に述べた順番どおりとなります。
      </p>
      <p className="text-muted-foreground text-sm">
        つまり、基本の順番は「SB → BB → … →
        BTN」であるが、一番最初だけSBとBBが最後に周されると覚えておくと良いでしょう。
      </p>
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
  );
}

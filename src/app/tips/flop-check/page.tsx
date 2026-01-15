export default function Page() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="font-bold font-montserrat text-2xl">
          フロップでチェックするシチュエーション
        </h1>
      </header>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          ポジションがなくて、相手のレンジと自分のレンジがほとんど変わらない場合は、
          フロップでチェックになりやすいです。
        </p>
        <p>
          この状況では、ベットしても優位性が小さく、相手に簡単に
          コールされやすい一方で、こちらのレンジも広いため
          反撃を受けやすくなります。
        </p>
        <p>
          チェックすることで、レンジ全体の防御を保ちながら
          相手のアクションを見てから判断できるのがメリットです。
        </p>
        <p className="text-muted-foreground text-xs">
          例: 低〜中くらいのドライなボードで、双方のレンジが近い場合。
        </p>
      </div>
    </div>
  );
}

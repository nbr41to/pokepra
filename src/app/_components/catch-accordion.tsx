import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function CatchAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-80">
      <AccordionItem value="what-is-monte-carlo leading-norma">
        <AccordionTrigger>まず、モンテカルロってなんですか？</AccordionTrigger>
        <AccordionContent className="gap-2 space-y-3 text-balance font-noto-sans-jp leading-relaxed">
          <p>
            モンテカルロ法という確率の計算方法のことです。簡単に言うと大量に同じことを繰り返して集計して確率を求める方法です。
            <Link className="underline" href="/tips/monte-carlo">
              こちらのページ
            </Link>
            で実際にサイコロを振ってモンテカルロ法を体験できます。
          </p>
          <p>
            モンテカルロポーカートレーナー（MCPT）は、そのモンテカルロ法によるシミュレーションを活用したポーカー練習ツールです。
          </p>
          <p>
            このモンテカルロ法を活用して、ポーカーにおける勝率や期待値をその場で高速で計算することができます。その結果を確認しながら実際にプレイすることによってプレイヤーの感覚を鍛え、意思決定能力の向上を目指します。
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="for-beginners">
        <AccordionTrigger>初心者でも大丈夫ですか？</AccordionTrigger>
        <AccordionContent className="gap-2 space-y-3 text-balance font-noto-sans-jp leading-relaxed">
          <p>
            もし、ポーカーを通して同じテーブルの人たちとの繋がりを深めたいと思えたのであれば、私と同じ想いであるでしょう。
          </p>
          <p>
            しかし、ポーカーを楽しむためには、ポーカーのルールや用語を知ることはもちろんのこと、戦略の大切さや深さに気がつきます。そこでGTOという言葉を知り、その難しさや複雑さに挫折した人は多いことでしょう。
          </p>
          <p>
            このアプリはポーカーを楽しむことを第一に考え、誰でも楽しむことができるように設計されています。初心者の方が、GTOのむずかしさをなるべく感じることなく、ポーカーの戦略を感覚的に学び、上達することを目指しています。
          </p>
          <p>
            ポーカーのルールや基本的な用語についての説明も充実させていきますので、一緒にポーカーを楽しみながら学んでいきましょう。
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="difficulty-level">
        <AccordionTrigger>むずかしいですか？</AccordionTrigger>
        <AccordionContent className="gap-2 space-y-3 text-balance font-noto-sans-jp leading-relaxed">
          <p>
            あなたのポーカーのプレイがGTO的に正しいかを確認するツールはたくさんあると思いますが、設定や操作方法が多くて頭が爆発したことがありませんか？私はあります。中にはプロも使っている万能な有料ツールもありますが、初心者にはハードルが高すぎます。
          </p>
          <p>
            このアプリはポーカーを上達するために必須とされているGTO（ゲーム理論最適戦略）を学ぶハードルを下げるためにあります。もしあなたが、ゲーム理論に詳しくて他のGTOのツールを使いこなしているのであれば、このアプリはやや物足りなく感じるかもしれません。
          </p>
          <p>
            ポーカーにハマっていて上達したいけど、GTOを学ぶのは難しくて気が進まないという方に特におすすめします。
          </p>
          <p>
            誰でもわかるように、なるべく説明や言葉を噛み砕いてわかりやすくしています。私自身も初学者であり拙い点が多いかもしれませんが、一緒に学んでいきましょう。
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="is-there-a-cost">
        <AccordionTrigger>お金はかかりますか？</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            <span className="font-bold">今は、</span>
            登録不要・無料です。
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

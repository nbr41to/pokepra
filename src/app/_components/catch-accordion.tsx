import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function CatchAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-72">
      <AccordionItem value="what-is-mcpt">
        <AccordionTrigger>What is Monte Carlo Poker Trainer?</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-balance font-noto-sans-jp">
          <p>
            モンテカルロポーカートレーナー（MCPT）は、モンテカルロ法によるシミュレーションを活用したポーカー練習ツールです。
          </p>
          <p>
            モンテカルロ法とは、簡単に言うと大量に同じことを繰り返して確率を求める方法です。
          </p>
          <p>
            このモンテカルロ法を活用して、勝率や期待値を計算します。その結果を確認しながら実際にプレイすることによってプレイヤーの感覚を鍛え、意思決定能力の向上を目指します。
          </p>
        </AccordionContent>
      </AccordionItem>
      {/* <AccordionItem value="registration-required">
        <AccordionTrigger className="font-bold font-noto-sans-jp">
          登録は必要ですか？
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="is-there-a-cost">
        <AccordionTrigger className="font-bold font-noto-sans-jp">
          お金がかかりますか？
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem> */}
      <AccordionItem value="difficulty-level">
        <AccordionTrigger className="font-noto-sans-jp">
          むずかしいですか？
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance font-noto-sans-jp">
          <p>
            このアプリはポーカーを上達するために必須とされているGTO（ゲーム理論最適戦略）を学ぶハードルを下げるためにあります。
          </p>
          <p>なるべく、説明や言葉を噛み砕いてわかりやすくしています。</p>
          <p>
            ポーカーにハマり上達したいけど、GTOを学ぶのは難しくて気が進まないという方に特におすすめします。
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="for-beginners">
        <AccordionTrigger className="font-noto-sans-jp">
          初心者でも大丈夫ですか？
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance font-noto-sans-jp">
          <p>
            このアプリには、ポーカーを上達を支援する目的と、ポーカーの楽しさを伝える2つの目的があります。
          </p>
          <p>ポーカーのルールや用語に関する説明も丁寧に案内します。</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

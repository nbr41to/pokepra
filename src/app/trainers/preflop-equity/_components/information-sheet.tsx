"use client";

import { CircleQuestionMark, X } from "lucide-react";
import Link from "next/link";
import { Combo } from "@/components/combo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { VillainHands } from "./villain-hands";

type Props = {
  className?: string;
};

export const InformationSheet = ({ className }: Props) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon-lg"
        >
          <CircleQuestionMark />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh" side="bottom">
        <ScrollArea className="h-dvh">
          <SheetHeader>
            <SheetTitle>Preflop Equity Simulator</SheetTitle>
            <SheetDescription className="">
              プリフロップ参加時の勝率を計算します。
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-5 font-noto-sans-jp">
            <h2 className="font-bold">これはなんですか？</h2>
            <p>
              これは、任意のポジション・ハンドにおいて参加した場合の後ろのポジションのプレイヤー全員との対戦をシュミレーションします。
            </p>
            <p>
              当然後ろに控えている相手が多いほど自分の勝率（EQ）を上回るハンドを持っている相手がいる確率は増えます。任意のポジション・ハンドにおいての参加の良し悪しを体感できるゲームとなっています。
            </p>
          </div>

          <VillainHands
            className="h-72"
            people={9}
            position={4}
            villains={EXAMPLE_VILLAINS}
            result={EXAMPLE_RESULT}
          />

          <div className="mx-auto my-4 grid w-fit place-items-center gap-y-1">
            <Combo hand={["3h", "3s"]} />
            <p className="font-noto-sans-jp text-xs">自分のハンド</p>
          </div>

          <div className="space-y-3 px-5 font-noto-sans-jp">
            <p>
              相手のハンドには1000回シュミレーションした結果から勝率を計算して表示しています。あくまでの自分のハンドとの勝率であることに注意してください。（全員参加しているわけではない）
            </p>
          </div>

          <div className="mt-16 space-y-3 px-5 pb-32 font-noto-sans-jp">
            <h2 className="font-bold">得点について</h2>
            <p>
              このトレーナーでは期待値（EV）を簡略化して学べます。POTの
              <span className="px-px text-suit-heart">120</span>
              点をを
              <span className="px-px text-suit-spade">100</span>
              点を支払って獲りにいくと仮定しています。つまり、勝てば120点を獲得し、負ければ100点を失います。これをEVに表すと
              <span className="block py-2 text-center font-bold">
                EV = (勝つ確率) ×
                <span className="px-px text-suit-heart">120</span>- (負ける確率)
                ×<span className="px-px text-suit-spade">100</span>
              </span>
              となります。例えばあなたのハンドの勝率が60%だった場合、
              <span className="block py-2 text-right font-bold">
                EV = 0.6 × <span className="px-px text-suit-heart">120</span> -
                0.4 × <span className="px-px text-suit-spade">100</span> = +32
              </span>
              となり、期待値は+32点となります。この場合は参加することが正しい選択となります。逆に勝率が30%だった場合は、
              <span className="block py-2 text-right font-bold">
                EV = 0.3 × <span className="px-px text-suit-heart">120</span> -
                0.7 × <span className="px-px text-suit-spade">100</span> = -34
              </span>
              となり、期待値は-34点となります。この場合はフォールドすることが正しい選択となります。
            </p>
            <p>
              実際の場面では、1回負ければ100点を失いますが、この期待値の値は、長期的に見た（これをたくさん繰り返した）場合の平均的な得点の増減を示しています。
            </p>
            <p>
              また、フォールドした場合は、何も失っていないため点数の変動はありません。
            </p>
            <p>
              ※このシュミレーションは、プリフロップ時点での勝率を計算して表示しているだけであり、よく使用されているプリフロップのハンドレンジ表との厳密な関連性はありません。
              <Link
                className="px-1 font-bold underline"
                href="/tips/starting-hand-equity"
              >
                スターティングハンドの勝率
              </Link>
              を把握する目的程度のものになります。
            </p>
          </div>

          <SheetFooter className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
            <SheetClose asChild>
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full opacity-90"
              >
                <X />
              </Button>
            </SheetClose>
          </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const EXAMPLE_VILLAINS = [
  ["As", "Th"],
  ["9h", "3c"],
  ["8h", "6h"],
  ["Kc", "8c"],
  ["Ad", "Kd"],
  ["Qc", "Jd"],
  ["Qh", "7s"],
  ["Tc", "2c"],
];
const EXAMPLE_RESULT = {
  hand: "3h 3s",
  equity: 0.5434375,
  data: [
    {
      hand: "8h 6h",
      equity: 0.5305,
    },
    {
      hand: "Ad Kd",
      equity: 0.5015,
    },
    {
      hand: "Kc 8c",
      equity: 0.4975,
    },
    {
      hand: "Qh 7s",
      equity: 0.4805,
    },
    {
      hand: "As Th",
      equity: 0.476,
    },
    {
      hand: "Qc Jd",
      equity: 0.4725,
    },
    {
      hand: "Tc 2c",
      equity: 0.3645,
    },
    {
      hand: "9h 3c",
      equity: 0.3295,
    },
  ],
};

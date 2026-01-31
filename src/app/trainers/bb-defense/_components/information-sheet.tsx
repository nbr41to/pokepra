"use client";

import { CircleQuestionMark, User2, X } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn/sheet";
import { TipsCard } from "@/features/tips/tips-card";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export const InformationSheet = ({ className }: Props) => {
  return (
    <Sheet modal={false}>
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
            <SheetTitle>BB Defense Trainer</SheetTitle>
            <SheetDescription className="">
              BBでのディフェンス判断を練習します。
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-3 pb-24">
            <TipsCard>
              <h2>ディフェンスとはなんなんですか？</h2>
              <p>
                BBのポジションは強制的に1BBとANTEを1BB支払います。このすでに支払った額を取り返す（守る）という意味でBBディフェンスと呼ぶことがあります。
              </p>
              <p>
                すでにチップを失っている状態からスタートするわけですが、見方を変えると追加でちょっと出せば相手のレイズにコールできるオトクな状態とも言えます。特に相手がコールして手番がきた場合は、チップを上乗せせずともフロップに進むことができます。
              </p>
            </TipsCard>

            <TipsCard>
              <h2>これはなんですか？</h2>
              <p>
                BBアンティあり・レーキ（5%）ありの9人プレイで、ランダムな相手のポジションからオープンレイズ（2〜10BB）がランダムにとんできます。（このゲームではコールで回ってくることはありません。）
              </p>
              <p>
                このときあなたのハンドのスターティングハンドの勝率が、相手のオープンレイズ額から計算される必要勝率に達しているかどうかを判断するゲームです。
              </p>
              <p>
                例えば、オープンレイズ額が3BBの場合の必要勝率は以下のように計算されます。
              </p>
              <p>必要勝率 = コール額 /（ポット - レーキ）</p>
              <p>コール額はすでに1BB支払っているので、2BB</p>
              <p>ポットは SB + BB + ANTE + レイズ額 + コール額で</p>
              <p className="text-right">0.5 + 1 + 1 + 3 + 2 = 7.5BB</p>
              <p>レーキは 7.5BB × 0.05 = 0.375BBとなるので</p>
              <p className="text-right">
                必要勝率 = 2 / (7.5 - 0.375) = 約28.57%
              </p>
              <p>
                このときにあなたのハンドの勝率が28.57%以上であればコールすることは、期待値がプラスになると考えることができます。
              </p>
              <p className="font-bold">
                ※
                実際にはフロップ以降の戦い方なども影響するため、必ずしもこの判断だけで正しいとは限りません。
              </p>
            </TipsCard>

            <TipsCard>
              <h2>3人以上に対応！</h2>
              <p>
                相手の人数（自分以外）を 1 〜 3 人にすることが可能です。
                <User2 className="mr-1 inline size-5" />
                アイコンのボタンで切り替えることができます。2人以上の場合は、オープンした人のレンジ内で相手のハンドは抽選されます。
              </p>
              <p>
                <User2 className="mr-1 inline" />
                ... 相手が 1 人
              </p>
              <p>
                <User2 className="mr-1 inline" />
                ... 相手が 1 〜 3 人
              </p>
            </TipsCard>

            <TipsCard>
              <h2>得点について</h2>
              <p>
                あなたがコール（参加）した場合は、勝率に応じた期待値を四捨五入した値が得点になります。
              </p>
              <p>
                例えば、3BBレイズに対して、あなたが2BBでコールして、POTが7.5Bbであなたの勝率が30%の場合は、
              </p>
              <p className="whitespace-pre-wrap text-right">
                {
                  "期待値 = (POT - レーキ) × 勝率 - コール額 \n= (7.5 - 0.375) × 0.3 - 2 \n= 0.1375BB"
                }
              </p>
              <p></p>
              <p>
                あなたがFoldした場合は、実際のポーカーと同様にBBとANTEを失います。
              </p>
              <p>
                ここで気づくことはBBのポジションは不利ということです。ゲームを繰り返すほどあなたのスタックは減っていくことでしょう。このゲームはBBのポジションでの損失を少なくするための感覚を身につけることができます。
              </p>
            </TipsCard>

            <TipsCard>
              <h2>シュミレーションについて</h2>
              <p>
                勝率を計算するために以下のシュミレーションを実行しています。
              </p>
              <p>
                相手のレンジからランダムにハンドを人数分抽選して、あなたのハンドとそのままリバーまで100回対戦することを200回繰り返し、その平均勝率を計算しています。
              </p>
            </TipsCard>
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

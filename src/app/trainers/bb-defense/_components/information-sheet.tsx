"use client";

import { CircleQuestionMark, X } from "lucide-react";
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
            <SheetTitle>BB Defense Trainer</SheetTitle>
            <SheetDescription className="">
              BBでのディフェンス判断を練習します。
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-5 pb-24 font-noto-sans-jp">
            <h1 className="font-bold">これはなんですか？</h1>
            <p>
              BBアンティあり・レーキありの9人プレイで、相手のポジションと
              オープンレイズ額（2〜8BB）がランダムに決まる状況を想定します。
            </p>
            <p>
              その相手レンジに対してBBでコールしたときの勝率（エクイティ）を
              1000回のシミュレーションで見積もります。
            </p>
            <p>
              必要勝率は、BBが追加で支払うコール額と、
              レーキ控除後の最終ポットから計算します。
            </p>
            <div className="space-y-1">
              <p className="font-bold">必要勝率の計算式</p>
              <p>必要勝率 = コール額 /（ポット - レーキ）</p>
              <p className="text-muted-foreground text-xs">
                例: Open Raise 4BB のとき、コール額=3BB。 ポットは
                SB(0.5)+BB(1)+BBアンティ(1)+Open Raise(4)+コール(3)=9.5BB。
                レーキ5%なら 0.475BB、必要勝率は 3 / (9.5 - 0.475)。
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-bold">獲得POT（コール時）</p>
              <p>勝った場合: ポット - レーキ -（BB + BBアンティ + コール額）</p>
              <p>負けた場合: -(BB + BBアンティ + コール額)</p>
              <p className="text-muted-foreground text-xs">
                フォールド時は BB と BBアンティのみ支払いです。
              </p>
            </div>
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

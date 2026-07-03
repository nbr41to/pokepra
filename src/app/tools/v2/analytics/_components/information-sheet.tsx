"use client";

import { ChartColumn, CircleQuestionMark, X } from "lucide-react";
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
            <SheetTitle>Full Street Simulator</SheetTitle>
            <SheetDescription className="">
              1ハンドのフルストリートをシュミレーションします。
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-5 font-noto-sans-jp">
            <h2 className="font-bold">これはなんですか？</h2>
            <p>
              プリフロップからリバーまでのストリートの間の様々な局面における勝率の感覚を養います。アクション後にボードの上に勝率の情報表示されます。
            </p>
            <p>
              勝率の情報はBBを想定した対戦相手と1000回のシュミレーションした結果から勝率と勝ったときの役を計算しています。
            </p>
            <p>
              BBを想定した対戦相手を1プレイヤーおいています。これは実践をイメージしやすくするためであり、勝ち負けはさほど重要ではありません。
            </p>

            <p>
              ※注意すべき点は勝率を参考にアクションをすることはGTOに反するプレイであるということです。GTOの戦略は勝率に関わらず毎回バランス取れたアクションをすることが重要になります。あくまで勝率の感覚を養うためのツールとして使用してください。
            </p>
          </div>

          <div className="mt-5 space-y-3 px-5 pb-24 font-noto-sans-jp">
            <h2 className="font-bold">
              各シチュエーションごとに分析を確認できます。
            </h2>
            <p>
              下にある
              <Button size="icon-sm" className="mx-1 rounded-full">
                <ChartColumn />
              </Button>
              のボタンを押すと分析結果を確認できます。勝率の情報同様の1000回のシュミレーションした結果の詳細を確認できます。
            </p>
            <p>
              レンジごとの勝率の分布を確認したり、自分のコンボはナッツから何番目なのかを確認することができます。
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

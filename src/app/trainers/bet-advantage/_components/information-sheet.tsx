"use client";

import { CircleQuestionMark, X } from "lucide-react";
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

      <SheetContent className="h-dvh pb-14" side="bottom">
        <ScrollArea className="h-dvh">
          <SheetHeader>
            <SheetTitle>Bet Advantage Trainer</SheetTitle>
            <SheetDescription className="">
              ベットサイズごとのEVを比較しながら最適なアクションを考えます。
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-5 font-noto-sans-jp">
            <h2 className="font-bold">これはなんですか？</h2>
            <p>
              自分のレンジとBBのレンジを想定して、各ベットサイズごとの期待値
              (EV) を比較するトレーナーです。
            </p>
            <p>
              まず自分のポジションに対応するレンジと、BBの想定レンジから range
              vs range の勝率を計算します。
            </p>
            <p>
              その結果から、BBが各ベットサイズに対して続行するハンドだけを
              抽出し、相手レンジを絞り込みます。
            </p>
          </div>

          <div className="mt-5 space-y-3 px-5 pb-24 font-noto-sans-jp">
            <h2 className="font-bold">EVの計算方法</h2>
            <p>ベット額に応じて、相手に必要な勝率を提示します。</p>
            <p>必要勝率 = ベット額 / (ポット + ベット額 × 2)</p>
            <p>
              必要勝率を満たすハンドのみが続行レンジになります。続行レンジでの
              自分の勝率 (CE) と、フォールドする確率 (FE)
              を使ってEVを計算します。
            </p>
            <div className="space-y-1">
              <p className="font-bold">EVの計算式</p>
              <p>
                EV = ポット × FE + (1 - FE) × CE × (ポット + ベット額 × 2) -
                ベット額
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              ボタンの右下に表示される数値が、そのベットサイズのEVです。
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

"use client";

import { CircleQuestionMark, Lock, X } from "lucide-react";
import Link from "next/link";
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
            <SheetTitle>Preflop Stricter</SheetTitle>
            <SheetDescription className="">
              オープンレンジの厳格化
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-5 font-noto-sans-jp">
            <h2 className="font-bold">これはなんですか？</h2>
            <p>
              プリフロップのオープンレンジをより厳格に覚えるためのシンプルな◯✕クイズです。
            </p>
            <p>
              <Link
                href="/settings/open-range"
                className="px-1 font-bold underline"
              >
                オープンレンジの設定ページ
              </Link>
              で設定したレンジに基づいて、各ポジションからのオープンレンジを覚えます。各ハンドでオープンするかフォールドするかを選択し、正しい選択ができているかを確認します。
            </p>
            <p>
              ポジションはUTG→BTNを順番に移動しますが、下の
              <Lock className="mx-1 inline" size={20} />
              アイコンをタップすることで現在のポジションをロックし、同じポジションで繰り返し練習することもできます。
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

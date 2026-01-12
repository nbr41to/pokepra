"use client";

import { CircleQuestionMark, X } from "lucide-react";
import { Combo } from "@/components/combo";
import { Button } from "@/components/ui/button";
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
          <CircleQuestionMark size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh" side="bottom">
        <SheetHeader>
          <SheetTitle>これはなんですか？</SheetTitle>
          <SheetDescription className="">preflop Guide</SheetDescription>
        </SheetHeader>

        <div>
          <div className="space-y-3 px-5 font-noto-sans-jp">
            <p>
              これは、任意のポジション・ハンドにおいて参加した場合の後ろのポジションのプレイヤー全員との対戦をシュミレーションします。
            </p>
            <p>
              シュミレーションの結果から勝率を計算し、50%を上回っていない場合に減点されます。全員のプレイヤーに勝率50%を上回っていた場合は加点となります。
            </p>
            <p>フォールドした場合は点数の変動はありません。</p>
            <p>
              任意のポジション・ハンドにおいての参加の良し悪しを体感できるゲームとなっています。
            </p>
          </div>
          <VillainHands
            people={9}
            position={1}
            villains={EXAMPLE_VILLAINS}
            result={EXAMPLE_RESULT}
          />
          <div className="mx-auto my-4 grid w-fit place-items-center gap-y-1">
            <Combo hand={["3h", "3s"]} />
            <p className="font-noto-sans-jp text-xs">自分のハンド</p>
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

"use client";

import { Settings, X } from "lucide-react";
import { useState } from "react";
import { InputBoard } from "@/components/input-board";
import { InputCards } from "@/components/input-cards";
import { SelectPosition } from "@/components/select-position";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { toHandArray, toHandString } from "@/utils/card";
import { useHoldemStore } from "./_utils/state";

type Props = {
  initialHero: string[];
  initialBoard: string[];
  className?: string;
};

export const EditSituationSheet = ({
  initialHero,
  initialBoard,
  className,
}: Props) => {
  const { position: initialPosition, setSituation } = useHoldemStore();
  const [open, setOpen] = useState(false);
  const [hero, setHero] = useState(initialHero);
  const [board, setBoard] = useState(initialBoard);
  const [position, setPosition] = useState(initialPosition);

  const handleSubmit = () => {
    setSituation(hero, board, position);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className={cn("rounded-full", className)}
          variant="outline"
          size="icon-lg"
        >
          <Settings />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-dvh" side="bottom">
        <ScrollArea className="h-dvh">
          <SheetHeader>
            <SheetTitle>Setting Situation</SheetTitle>
            <SheetDescription className="">
              分析したいシチュエーションを設定します。
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-2 px-4">
            <Label className="font-bold">
              <span>
                あなたのハンド<span className="text-muted-foreground">*</span>
                （2枚のみ）
              </span>
            </Label>
            <InputCards
              value={toHandString(hero)}
              onChange={(value) => setHero(toHandArray(value))}
              limit={2}
              banCards={board}
            />
            <Label className="font-bold">ボード（0 ~ 5枚）</Label>
            <InputBoard
              value={toHandString(board)}
              onChange={(value) => setBoard(value.split(" "))}
              limit={5}
              banCards={hero}
            />
            <Label className="font-bold">ポジション</Label>
            <SelectPosition
              className="pb-4"
              total={9}
              value={position}
              setValue={setPosition}
            />
            <Button
              className="w-full rounded-full"
              size="lg"
              disabled={hero.length !== 2 || board.length > 5}
              onClick={handleSubmit}
            >
              反映する
            </Button>
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

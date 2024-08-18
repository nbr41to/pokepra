"use client";

import { ChangeModeButton } from "@/components/ChangeModeButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { AiOutlineExperiment } from "react-icons/ai";

export const Header = () => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <header className="fixed flex w-full items-center justify-between border-b bg-background px-3 sm:max-w-sm">
        <Sheet open={opened} onOpenChange={setOpened}>
          <SheetTrigger>
            <HiOutlineMenuAlt2 size={24} />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>ハンド記録ツール</SheetTitle>
              <SheetDescription>
                これはポーカー訓練生のためのハンド記憶ツールです。初心者の頃って前のハンドをすぐに忘れてしまいますよね。そんな時に使ってください。
              </SheetDescription>
              <SheetDescription>
                記録したデータは30日間保存されます。
              </SheetDescription>
            </SheetHeader>

            <div className="flex justify-center gap-4 py-6">
              <Button
                className="font-bold"
                asChild
                onClick={() => setOpened(false)}
              >
                <Link href="/list/new">記録をする</Link>
              </Button>
              <Button
                className="font-bold"
                asChild
                onClick={() => setOpened(false)}
              >
                <Link href="/list">記録を見る</Link>
              </Button>
            </div>

            <div className="text-right">
              <Button
                variant="outline"
                size="icon"
                asChild
                onClick={() => setOpened(false)}
              >
                <Link href="/nfc">
                  <AiOutlineExperiment size={24} />
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/">
          <h1 className="font-bold">pokepra</h1>
        </Link>

        <ChangeModeButton />
      </header>
    </>
  );
};

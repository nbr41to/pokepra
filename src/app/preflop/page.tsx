"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionArea } from "./_components/action-area";
import { OtherPlayers } from "./_components/other-players";
import { ResultArea } from "./_components/result-area";
import { useActionStore } from "./_utils/state";

export default function Page() {
  const { stack, shuffleAndDeal, reset, retry } = useActionStore();
  const [notBlur, setNotBlur] = useState(false);

  useEffect(() => {
    shuffleAndDeal();

    return reset;
  }, [shuffleAndDeal, reset]);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-end p-2 pb-10">
      <ResultArea />
      <OtherPlayers />
      <ActionArea />
      {/** biome-ignore lint/a11y/useSemanticElements: <explanation> */}
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "fixed z-10 grid h-dvh w-screen place-content-center bg-background/50 indent-0",
          stack > 0 && "hidden",
          !notBlur && "backdrop-blur-xs",
        )}
        onClick={() => setNotBlur((prev) => !prev)}
        onKeyDown={() => setNotBlur((prev) => !prev)}
        onKeyUp={() => setNotBlur((prev) => !prev)}
      >
        <p className="text-xl">Game over</p>
        <Button
          className="mt-4 rounded-full"
          size="lg"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            retry();
          }}
        >
          Retry
        </Button>
      </div>
    </div>
  );
}

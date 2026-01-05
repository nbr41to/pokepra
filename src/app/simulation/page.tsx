"use client";

import { useState } from "react";
import { SuitIcon } from "@/components/suit-icon";
import { Label } from "@/components/ui/label";
import { RANKS, SUITS } from "@/constants/card";
import { cn } from "@/lib/utils";

export default function Page() {
  const [target, setTarget] = useState<null | "hero" | "board" | "compare">(
    null,
  );
  const [hero, setHero] = useState("");
  const [board, setBoard] = useState("");
  const [compare, setCompare] = useState("");

  const handleOnClickCard = (inputValue: string) => {
    const targetValue =
      target === "hero" ? hero : target === "board" ? board : compare;
    const isSuited = (SUITS as string[]).includes(inputValue.toLowerCase());
    if (target === "hero" && targetValue.length > 3) return;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-8 overflow-scroll p-6">
      <h1 className="font-bold font-montserrat text-2xl">
        Monte Carlo Simulation
      </h1>
      <div>
        <div>
          <Label>hero</Label>
          <button
            type="button"
            className={cn(
              "rounded border p-2",
              target === "hero" && "ring-2 ring-green-400 ring-offset-2",
            )}
            onClick={() => setTarget("hero")}
          >
            {hero || "Select Hero Hand"}
          </button>
        </div>
        <div>
          <Label>board</Label>
          <button
            type="button"
            className={cn(
              "rounded border p-2",
              target === "board" && "ring-2 ring-green-400 ring-offset-2",
            )}
            onClick={() => setTarget("board")}
          >
            {board || "Select Board Cards"}
          </button>
        </div>
        <div>
          <Label>compare</Label>
          <button
            type="button"
            className={cn(
              "rounded border p-2",
              target === "compare" && "ring-2 ring-green-400 ring-offset-2",
            )}
            onClick={() => setTarget("compare")}
          >
            {compare || "Select Compare Hand"}
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 flex w-full gap-x-1 p-2">
        <div className="flex flex-col gap-y-1">
          {SUITS.map((suit) => (
            <button
              key={suit}
              type="button"
              className="grid size-14 place-items-center rounded border p-3"
              // onClick={}
            >
              <SuitIcon
                className={cn(
                  suit === "s" && "text-blue-400 dark:text-blue-600",
                  suit === "h" && "text-pink-400 dark:text-pink-600",
                  suit === "d" && "text-orange-400 dark:text-orange-600",
                  suit === "c" && "text-green-400 dark:text-green-600",
                )}
                suit={suit}
                size={24}
                strokeWidth={2.5}
              />
            </button>
          ))}
        </div>
        <div className="flex h-full flex-wrap gap-1">
          {RANKS.map((rank) => (
            <button
              key={rank}
              type="button"
              className="grid size-14 place-items-center rounded border p-3 text-lg"
              // onClick={}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

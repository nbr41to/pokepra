"use client";

import { CircleX } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { InputCardPalette } from "./input-card-palette";
import { PlayCard } from "./play-card";
import { Button } from "./shadcn/button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  banCards?: string[];
};
export const InputHands = ({
  value,
  onChange,
  limit,
  banCards = [],
}: Props) => {
  const [active, setActive] = useState(false);

  // palette外クリックで閉じる
  useEffect(() => {
    if (!active) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const palette = document.getElementById("input-card-palette");
      if (!palette) return;
      const targetNode = e.target as Node | null;
      if (targetNode && palette.contains(targetNode)) return;
      setActive(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [active]);

  return (
    <div className="relative">
      <div className="relative flex items-center gap-x-1">
        <button
          type="button"
          className={cn(
            "flex h-16 w-full items-center gap-1 overflow-x-scroll rounded-md border px-4 py-2",
            active &&
              "bg-green-200 ring-2 ring-green-400 ring-offset-2 ring-offset-background dark:bg-green-900 dark:ring-green-600",
          )}
          onClick={() => {
            setActive(true);
          }}
        >
          {value ? (
            value.split("; ").map((hand, i) => (
              <Fragment key={hand}>
                {hand.split(" ").map((card) => (
                  <PlayCard
                    key={card}
                    rs={card}
                    size="sm"
                    className="w-8 shrink-0"
                  />
                ))}
                <span
                  className={cn(
                    "grid h-full place-content-end",
                    value.split(";").length === i + 1 && "hidden",
                    hand.split(" ").length % 2 && "hidden",
                  )}
                >
                  ,
                </span>
              </Fragment>
            ))
          ) : (
            <div className="text-sm">Select Compare Hands</div>
          )}
        </button>
        <Button size="icon-lg" variant="ghost" onClick={() => onChange("")}>
          <CircleX />
        </Button>
      </div>
      {value && (
        <div className="absolute right-14 -bottom-6 text-xs">
          ({value.split("; ").length})
        </div>
      )}
      {active && (
        <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center gap-x-1 bg-background">
          <InputCardPalette
            value={value}
            handSeparator={"; "}
            limit={limit}
            banCards={banCards}
            onChange={(val) => onChange(val)}
            onEnter={() => setActive(false)}
          />
        </div>
      )}
    </div>
  );
};

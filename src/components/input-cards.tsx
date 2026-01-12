'use client";';

import { ListX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { InputCardPalette } from "./input-card-palette";
import { PlayCard } from "./play-card";
import { Button } from "./ui/button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  banCards?: string[];
};
export const InputCards = ({
  value,
  onChange,
  limit,
  banCards = [],
}: Props) => {
  const [active, setActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // palette外クリックで閉じる
  useEffect(() => {
    if (!active) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const targetNode = e.target as Node | null;
      if (!targetNode) return;
      if (buttonRef.current?.contains(targetNode)) return;
      if (paletteRef.current?.contains(targetNode)) return;
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
    <div>
      <div className="flex items-center gap-x-1">
        <button
          ref={buttonRef}
          type="button"
          className={cn(
            "flex h-16 w-full flex-wrap items-center gap-1 rounded-md border-2 px-4 py-2",
            active &&
              "bg-green-200 ring-2 ring-green-400 ring-offset-2 ring-offset-background dark:bg-green-900 dark:ring-green-600",
          )}
          onClick={() => setActive(true)}
        >
          {value ? (
            value
              .split(" ")
              .map((card) => (
                <PlayCard key={card} rs={card} size="sm" className="w-8" />
              ))
          ) : (
            <div className="text-sm">Select Hero Hand</div>
          )}
        </button>
        <Button size="icon-lg" variant="ghost" onClick={() => onChange("")}>
          <ListX size={32} />
        </Button>
      </div>
      {active && (
        <div
          ref={paletteRef}
          className="fixed bottom-0 left-0 z-50 flex w-full justify-center gap-x-1 bg-background p-2"
        >
          <InputCardPalette
            value={value}
            limit={limit}
            banCards={banCards}
            onChange={(val) => onChange(val)}
          />
        </div>
      )}
    </div>
  );
};

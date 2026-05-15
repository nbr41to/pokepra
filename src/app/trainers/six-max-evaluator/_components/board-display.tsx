"use client";

import { PlayCard } from "@/components/play-card";
import { cn } from "@/lib/utils";

type Props = {
  board: string[];
  className?: string;
};

/**
 * ボードカード表示 (空のスロットは灰色プレースホルダー)
 */
export const BoardDisplay = ({ board, className }: Props) => {
  const slots = Array.from({ length: 5 }).map((_, i) => board[i]);

  return (
    <div className={cn("flex justify-center gap-1.5", className)}>
      {slots.map((rs, index) => (
        <div
          key={`${index}-${rs ?? "empty"}`}
          className="flex h-20 w-15 items-center justify-center"
        >
          {rs ? (
            <PlayCard rs={rs} size="md" />
          ) : (
            <div className="h-20 w-15 rounded-md border-2 border-muted border-dashed bg-muted/20" />
          )}
        </div>
      ))}
    </div>
  );
};

"use client";

import { PlayCard } from "@/components/play-card";
import { cn } from "@/lib/utils";

type Props = {
  hero: string[];
  className?: string;
};

/**
 * Heroの手札を表示
 */
export const HandDisplay = ({ hero, className }: Props) => {
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {hero.map((rs) => (
        <PlayCard key={rs} rs={rs} size="md" />
      ))}
    </div>
  );
};

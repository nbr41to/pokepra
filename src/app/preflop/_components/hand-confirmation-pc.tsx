"use client";

import { useEffect, useRef, useState } from "react";

import { PlayHandCard } from "@/components/play-hand-card";

type Props = {
  hands: string[];
};

export const HandConfirmationPc = ({ hands }: Props) => {
  const [hand1, hand2] = hands;
  const [flipProgress, setFlipProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoStartDelayMs = 2000;

  useEffect(() => {
    // Reset to back and schedule auto-open when hands change.
    setFlipProgress(0);
    setLocked(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFlipProgress(1);
      setLocked(true);
    }, autoStartDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hands]);

  const clamped = Math.min(Math.max(flipProgress, 0), 1);
  const accelerateStart = (value: number) => {
    const breakpoint = 0.25;
    if (value <= breakpoint) return Math.min(value * 2, 1);
    const fastPortion = breakpoint * 2;
    const remaining = (value - breakpoint) / (1 - breakpoint);
    return fastPortion + remaining * (1 - fastPortion);
  };
  const mappedProgress = accelerateStart(clamped);
  const rotation = 180 - mappedProgress * 180;

  return (
    <div className="relative flex aspect-video w-100 items-center justify-evenly rounded-md border-2 bg-orange-50 shadow-md dark:bg-orange-950/60">
      <div className="relative top-1">
        <div className="relative -left-4 rotate-5">
          <FlipCard
            rotation={rotation}
            suit={hand1[1] as "s" | "h" | "d" | "c"}
            rank={hand1[0]}
          />
        </div>
        <div className="absolute -top-1.5 left-6 -rotate-5">
          <FlipCard
            rotation={rotation}
            suit={hand2[1] as "s" | "h" | "d" | "c"}
            rank={hand2[0]}
          />
        </div>
      </div>
    </div>
  );
};

const FlipCard = ({
  suit,
  rank,
  rotation,
}: {
  suit: "s" | "h" | "d" | "c";
  rank: string;
  rotation: number;
}) => {
  return (
    <div className="relative h-42 w-32 [perspective:1200px]">
      <div
        className="relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
          <PlayHandCard suit={suit} rank={rank} />
        </div>
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <PlayHandCard />
        </div>
      </div>
    </div>
  );
};

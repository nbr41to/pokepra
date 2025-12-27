"use client";

import { useEffect, useRef, useState } from "react";

import { PlayCard } from "@/components/play-card";

type Props = {
  cards: string[];
};

export const Board = ({ cards }: Props) => {
  const [flipProgress, setFlipProgress] = useState<number[]>(
    Array(cards.length).fill(0),
  );
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const baseDelayMs = 200;
  const stepDelayMs = 220;

  useEffect(() => {
    // reset progress to back
    setFlipProgress(Array(cards.length).fill(0));
    // clear previous timers
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    // schedule flips left -> right
    cards.forEach((_, index) => {
      const timer = setTimeout(
        () => {
          setFlipProgress((prev) => {
            const next = [...prev];
            next[index] = 1;
            return next;
          });
        },
        baseDelayMs + index * stepDelayMs,
      );
      timeoutsRef.current.push(timer);
    });
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [cards]);

  return (
    <div className="mx-auto flex w-88 gap-x-2">
      {cards.map((card, index) => {
        const suit = card[1] as "s" | "h" | "d" | "c";
        const rank = card[0];
        return (
          <FlipCard
            key={card}
            suit={suit}
            rank={rank}
            progress={flipProgress[index] ?? 0}
          />
        );
      })}
    </div>
  );
};

const FlipCard = ({
  suit,
  rank,
  progress,
}: {
  suit: "s" | "h" | "d" | "c";
  rank: string;
  progress: number;
}) => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const rotation = 180 - clamped * 180;

  return (
    <div className="perspective-distant relative h-22 w-16">
      <div
        className="transform-3d relative h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <div className="backface-hidden absolute inset-0 grid place-items-center">
          <PlayCard suit={suit} rank={rank} />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
          <PlayCard />
        </div>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useRef, useState } from "react";

import { PlayCard } from "@/components/play-card";

type Props = {
  cards: string[];
};

export const Board = ({ cards }: Props) => {
  const [cardStates, setCardStates] = useState<
    { card: string; delay: number; instant: boolean; animKey: string }[]
  >([]);
  const prevCardsRef = useRef<string[]>(cards);
  const baseDelayMs = 200;
  const stepDelayMs = 220;

  useEffect(() => {
    const prevCards = prevCardsRef.current;
    const isSingleAppend =
      cards.length === prevCards.length + 1 &&
      prevCards.every((card, idx) => cards[idx] === card);

    const nextStates = cards.map((card, idx) => {
      if (isSingleAppend && idx < prevCards.length) {
        // keep existing cards face up immediately
        return { card, delay: 0, instant: true, animKey: `${card}-static` };
      }
      const delay = isSingleAppend
        ? baseDelayMs
        : baseDelayMs + idx * stepDelayMs;
      // change animKey to force animation restart when cards change
      return {
        card,
        delay,
        instant: false,
        animKey: `${card}-${Date.now()}-${idx}`,
      };
    });

    setCardStates(nextStates);

    prevCardsRef.current = cards;
  }, [cards]);

  return (
    <div className="flex w-81 gap-x-1.5">
      {cardStates.map(({ card, delay, instant, animKey }) => {
        return (
          <FlipCard key={animKey} rs={card} delayMs={delay} instant={instant} />
        );
      })}
    </div>
  );
};

const FlipCard = ({
  rs,
  delayMs,
  instant,
}: {
  rs: string;
  delayMs: number;
  instant: boolean;
}) => {
  const initialRotation = instant ? 0 : 180;
  const animation = instant
    ? undefined
    : `flip 300ms ease-out ${delayMs}ms forwards`;

  return (
    <div className="perspective-distant relative h-20 w-15">
      <div
        className="transform-3d relative h-full w-full"
        style={{
          transform: `rotateY(${initialRotation}deg)`,
          animation,
        }}
      >
        <div className="backface-hidden absolute inset-0 grid place-items-center">
          <PlayCard rs={rs} />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
          <PlayCard />
        </div>
      </div>
    </div>
  );
};

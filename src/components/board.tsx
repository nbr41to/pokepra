"use client";

import { useEffect, useRef, useState } from "react";

import { PlayCard } from "@/components/play-card";
import { cn } from "@/lib/utils";

type Props = {
  cards: string[];
  disableAnimation?: boolean;
  className?: string;
};

const BASE_DELAY_MS = 200;
const STEP_DELAY_MS = 220;
const FLIP_DURATION_MS = 500;
const FLOP_SLIDE_DURATION_MS = 300;
const FLOP_FLIP_DELAY_MS = 0;
const CARD_WIDTH_PX = 60;
const CARD_GAP_PX = 6;
const CARD_PITCH_PX = CARD_WIDTH_PX + CARD_GAP_PX;
const FLOP_FLIP_INDEX = 2;
const FLOP_SLIDE_DELAY_MS = FLOP_FLIP_DELAY_MS + FLIP_DURATION_MS;

export const Board = ({
  cards,
  disableAnimation = false,
  className,
}: Props) => {
  const [cardStates, setCardStates] = useState<
    {
      card: string;
      delay: number;
      instant: boolean;
      animKey: string;
      animationType: "flip" | "flip-and-slide" | "show";
      slideFromPx: number;
      slideDelayMs: number;
    }[]
  >([]);
  const prevCardsRef = useRef<string[]>(cards);
  const prevDisableAnimationRef = useRef(disableAnimation);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const prevCards = prevCardsRef.current;
    const prevDisableAnimation = prevDisableAnimationRef.current;
    const isSameCards =
      cards.length === prevCards.length &&
      prevCards.every((card, idx) => cards[idx] === card);
    const isSameDisableAnimation = disableAnimation === prevDisableAnimation;

    // React Strict Mode may invoke effect twice on mount. Skip noop reruns.
    if (hasInitializedRef.current && isSameCards && isSameDisableAnimation) {
      return;
    }

    const isSingleAppend =
      cards.length === prevCards.length + 1 &&
      prevCards.every((card, idx) => cards[idx] === card);
    const isFlopOpen = cards.length === 3;

    const nextStates = cards.map((card, idx) => {
      if (disableAnimation) {
        return {
          card,
          delay: 0,
          instant: true,
          animKey: `${card}-static`,
          animationType: "flip" as const,
          slideFromPx: 0,
          slideDelayMs: 0,
        };
      }
      if (isSingleAppend && idx < prevCards.length) {
        // keep existing cards face up immediately
        return {
          card,
          delay: 0,
          instant: true,
          animKey: `${card}-static`,
          animationType: "flip" as const,
          slideFromPx: 0,
          slideDelayMs: 0,
        };
      }
      if (isFlopOpen) {
        if (idx === FLOP_FLIP_INDEX) {
          return {
            card,
            delay: FLOP_FLIP_DELAY_MS,
            instant: false,
            animKey: `${card}-${Date.now()}-${idx}`,
            animationType: "flip-and-slide" as const,
            slideFromPx: -CARD_PITCH_PX * 2,
            slideDelayMs: FLOP_SLIDE_DELAY_MS,
          };
        }

        return {
          card,
          delay:
            idx === 1
              ? FLOP_SLIDE_DELAY_MS + Math.floor(FLOP_SLIDE_DURATION_MS / 2)
              : FLOP_SLIDE_DELAY_MS,
          instant: false,
          animKey: `${card}-${Date.now()}-${idx}`,
          animationType: "show" as const,
          slideFromPx: 0,
          slideDelayMs: 0,
        };
      }
      const delay = isSingleAppend
        ? BASE_DELAY_MS
        : BASE_DELAY_MS + idx * STEP_DELAY_MS;
      // change animKey to force animation restart when cards change
      return {
        card,
        delay,
        instant: false,
        animKey: `${card}-${Date.now()}-${idx}`,
        animationType: "flip" as const,
        slideFromPx: 0,
        slideDelayMs: 0,
      };
    });

    setCardStates(nextStates);

    prevCardsRef.current = cards;
    prevDisableAnimationRef.current = disableAnimation;
    hasInitializedRef.current = true;
  }, [cards, disableAnimation]);

  return (
    <div className={cn("flex w-81 gap-x-1.5", className)}>
      {cardStates.map(
        (
          {
            card,
            delay,
            instant,
            animKey,
            animationType,
            slideFromPx,
            slideDelayMs,
          },
          idx,
        ) => {
          return (
            <BoardCard
              key={animKey}
              rs={card}
              delayMs={delay}
              instant={instant}
              animationType={animationType}
              slideFromPx={slideFromPx}
              slideDelayMs={slideDelayMs}
              slotIndex={idx}
            />
          );
        },
      )}
    </div>
  );
};

const BoardCard = ({
  rs,
  delayMs,
  instant,
  animationType,
  slideFromPx,
  slideDelayMs,
  slotIndex,
}: {
  rs: string;
  delayMs: number;
  instant: boolean;
  animationType: "flip" | "flip-and-slide" | "show";
  slideFromPx: number;
  slideDelayMs: number;
  slotIndex: number;
}) => {
  const cardZIndex = animationType === "flip-and-slide" ? 100 : 30 - slotIndex;

  if (animationType === "show") {
    const animation = instant
      ? undefined
      : `show-card 1ms linear ${delayMs}ms forwards`;
    return (
      <div
        className="relative h-20 w-15 overflow-visible"
        style={{ zIndex: cardZIndex }}
      >
        <div className="absolute inset-0 opacity-0" style={{ animation }}>
          <PlayCard rs={rs} />
        </div>
      </div>
    );
  }

  if (animationType === "flip-and-slide") {
    const initialTranslate = instant ? 0 : slideFromPx;
    const slideAnimation = instant
      ? undefined
      : `slide-to-position ${FLOP_SLIDE_DURATION_MS}ms ease-out ${slideDelayMs}ms forwards`;
    const initialRotation = instant ? 0 : 180;
    const flipAnimation = instant
      ? undefined
      : `flip ${FLIP_DURATION_MS}ms ease-out ${delayMs}ms forwards`;

    return (
      <div
        className="perspective-distant relative h-20 w-15 overflow-visible"
        style={{ zIndex: cardZIndex }}
      >
        <div
          className="transform-3d absolute inset-0 h-full w-full"
          style={{
            transform: `translateX(${initialTranslate}px)`,
            animation: slideAnimation,
          }}
        >
          <div
            className="transform-3d relative h-full w-full"
            style={{
              transform: `rotateY(${initialRotation}deg)`,
              animation: flipAnimation,
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
      </div>
    );
  }

  const initialRotation = instant ? 0 : 180;
  const animation = instant
    ? undefined
    : `flip 300ms ease-out ${delayMs}ms forwards`;

  return (
    <div
      className="perspective-distant relative h-20 w-15"
      style={{ zIndex: cardZIndex }}
    >
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

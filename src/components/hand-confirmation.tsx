"use client";

import { ArrowBigDownDash } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { PlayHandCard } from "@/components/play-hand-card";

/**
 * Preflopのカードを確認するためのUI
 */
type Props = {
  hands: string[];
  onOpenHand: () => void;
};

export const HandConfirmation = ({ hands, onOpenHand }: Props) => {
  const [hand1, hand2] = hands;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoCompleteThreshold = 3 / 5; // 60%
  const [flipProgress, setFlipProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [shifted, setShifted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const gestureRef = useRef<{ startX: number; startY: number } | null>(null);
  const guideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Reset guide timer when new hands render
    setShowGuide(false);
    setFlipProgress(0);
    setLocked(false);
    setShifted(false);
    gestureRef.current = null;
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    guideTimerRef.current = setTimeout(() => setShowGuide(true), 5000);
    return () => {
      if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    };
  }, [hands]);

  const hideGuide = () => {
    // Keep guide visible until cards are opened
    if (!locked && flipProgress < 1) return;
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    setShowGuide(false);
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    hideGuide();
    if (locked || event.pointerType !== "touch") return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const startZoneWidth = rect.width * 0.35;
    const startZoneHeight = rect.height * 0.35;
    const isInStartZone =
      x <= startZoneWidth && y >= rect.height - startZoneHeight;
    if (!isInStartZone) return;

    gestureRef.current = { startX: x, startY: y };
    containerRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    hideGuide();
    if (locked || !gestureRef.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const deltaX = x - gestureRef.current.startX;
    const requiredDistance = rect.width * 0.6;

    const next = clamp(deltaX / requiredDistance, 0, 1);
    setFlipProgress(next);
    if (next >= 1) {
      setLocked(true);
      onOpenHand();
    }
  };

  const resetGesture = (event: PointerEvent<HTMLDivElement>) => {
    if (gestureRef.current) {
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
    hideGuide();
    if (!locked) {
      if (flipProgress >= autoCompleteThreshold) {
        setFlipProgress(1);
        setLocked(true);
        onOpenHand();
      } else {
        setFlipProgress(0);
      }
    }
    gestureRef.current = null;
  };

  useEffect(() => {
    if (locked && flipProgress >= 1) {
      setShifted(true);
    } else {
      setShifted(false);
    }
  }, [locked, flipProgress]);

  if (hands.length !== 2) return null;

  return (
    <div
      ref={containerRef}
      className="relative flex aspect-video w-full touch-none select-none items-center justify-evenly rounded-md border-2 bg-orange-50 dark:bg-orange-950/60"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={resetGesture}
      onPointerCancel={resetGesture}
    >
      {!locked && showGuide && (
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-[35%] w-[35%] animate-pulse rounded-md border-2 border-green-400/70 border-dashed bg-green-200/20">
          <ArrowBigDownDash className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-240 text-green-500" />
          <span className="absolute bottom-1 left-2 font-montserrat text-green-500 text-xs">
            Swipe start
          </span>
        </div>
      )}
      <div
        className={`relative top-1 transform transition-transform duration-300 ${
          shifted
            ? "translate-x-28 translate-y-4"
            : "translate-x-0 translate-y-0"
        }`}
      >
        <div className="relative top-0 -left-8 z-10 rotate-6">
          <FlipCard
            progress={flipProgress}
            suit={hand1[1] as "s" | "h" | "d" | "c"}
            rank={hand1[0]}
          />
        </div>
        <div className="absolute top-0 left-2 -rotate-5">
          <FlipCard
            progress={flipProgress}
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
  progress,
}: {
  suit: "s" | "h" | "d" | "c";
  rank: string;
  progress: number;
}) => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const accelerateStart = (value: number) => {
    const breakpoint = 0.25; // first quarter of the swipe
    if (value <= breakpoint) return Math.min(value * 2, 1); // 2x speed early
    const fastPortion = breakpoint * 2; // output at breakpoint (0.5)
    const remaining = (value - breakpoint) / (1 - breakpoint);
    return fastPortion + remaining * (1 - fastPortion); // linear remainder
  };
  const mappedProgress = accelerateStart(clamped);
  const rotation = 180 - mappedProgress * 180;

  return (
    <div className="perspective-distant relative h-42 w-32">
      <div
        className="transform-3d relative h-full w-full transition-transform duration-75"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <div className="backface-hidden absolute inset-0 grid place-items-center">
          <PlayHandCard suit={suit} rank={rank} />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
          <PlayHandCard />
        </div>
      </div>
    </div>
  );
};

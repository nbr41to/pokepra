"use client";

import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { PlayCard } from "@/components/play-card";

type Props = {
  hands: string[];
};

export const HandConfirmation = ({ hands }: Props) => {
  const [hand1, hand2] = hands;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoCompleteThreshold = 3 / 5; // 60%
  const [flipProgress, setFlipProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const gestureRef = useRef<{ startX: number; startY: number } | null>(null);
  const guideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Reset guide timer when new hands render
    setShowGuide(false);
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    guideTimerRef.current = setTimeout(() => setShowGuide(true), 3000);
    return () => {
      if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    };
  }, [hands]);

  const hideGuide = () => {
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
      } else {
        setFlipProgress(0);
      }
    }
    gestureRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex aspect-video w-100 touch-none items-center justify-evenly rounded-md border-2 bg-orange-50 shadow-md dark:bg-orange-950/60"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={resetGesture}
      onPointerCancel={resetGesture}
    >
      {showGuide && (
        <div className="pointer-events-none absolute bottom-0 left-0 h-[35%] w-[35%] animate-pulse rounded-md border-2 border-green-400/70 border-dashed bg-green-200/20">
          <span className="absolute bottom-1 left-2 font-bold font-montserrat text-green-500 text-xs">
            Swipe start
          </span>
        </div>
      )}
      <div className="relative top-1">
        <div className="relative -left-4 rotate-5">
          <FlipCard
            progress={flipProgress}
            suit={hand1[1] as "s" | "h" | "d" | "c"}
            rank={hand1[0]}
          />
        </div>
        <div className="absolute -top-1.5 left-6 -rotate-5">
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
    <div className="relative h-42 w-32 [perspective:1200px]">
      <div
        className="relative h-full w-full transition-transform duration-75 [transform-style:preserve-3d]"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden]">
          <PlayCard suit={suit} rank={rank} />
        </div>
        <div className="absolute inset-0 grid place-items-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <PlayCard />
        </div>
      </div>
    </div>
  );
};

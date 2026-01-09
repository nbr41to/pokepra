"use client";

import { ArrowBigUpDash } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PlayCard } from "./play-card";

/**
 * Preflopのカードを確認するためのUI
 */
type Props = {
  hands: string[];
  onOpenHand: () => void;
  disabledFold?: boolean;
  onFold?: () => void;
  className?: string;
};

export const HandConfirmation = ({
  hands,
  onOpenHand,
  disabledFold = false, // TODO: fold機能を無効化するオプション
  onFold,
  className,
}: Props) => {
  const [hand1, hand2] = hands;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoCompleteThreshold = 3 / 5; // 60%
  const [flipProgress, setFlipProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [shifted, setShifted] = useState(false);
  const [folded, setFolded] = useState(false);
  const [foldLift, setFoldLift] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    type: "flip" | "fold";
  } | null>(null);
  const guideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Reset guide timer when new hands render
    setShowGuide(false);
    setFlipProgress(0);
    setLocked(false);
    setShifted(false);
    setFolded(false);
    setFoldLift(0);
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
    if (event.pointerType !== "touch") return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Allow fold gesture only after cards are opened
    if (locked && flipProgress >= 1 && !folded && !disabledFold) {
      const foldZoneWidth = rect.width * 0.5;
      const foldZoneHeight = rect.height * 0.4;
      const isInFoldZone =
        x >= rect.width - foldZoneWidth && y >= rect.height - foldZoneHeight;

      if (isInFoldZone) {
        gestureRef.current = { startX: x, startY: y, type: "fold" };
        containerRef.current?.setPointerCapture(event.pointerId);
      }
      return;
    }

    if (locked) return;

    const startZoneWidth = rect.width * 0.6;
    const startZoneHeight = rect.height * 0.6;
    const isInStartZone =
      x <= startZoneWidth && y >= rect.height - startZoneHeight;
    if (!isInStartZone) return;

    gestureRef.current = { startX: x, startY: y, type: "flip" };
    containerRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    hideGuide();
    if (!gestureRef.current) return;
    if (gestureRef.current.type === "flip" && locked) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (gestureRef.current.type === "flip") {
      const x = event.clientX - rect.left;
      const deltaX = x - gestureRef.current.startX;
      const requiredDistance = rect.width * 0.6;

      const next = clamp(deltaX / requiredDistance, 0, 1);
      setFlipProgress(next);
      if (next >= 1) {
        setLocked(true);
        onOpenHand();
      }
      return;
    }

    if (disabledFold) return;

    const y = event.clientY - rect.top;
    const deltaY = gestureRef.current.startY - y;
    const requiredLift = rect.height * 0.3;
    const lift = clamp(deltaY, 0, requiredLift);
    setFoldLift(lift);
    if (deltaY >= requiredLift && !folded) {
      setFolded(true);
      setFoldLift(requiredLift);
      onFold?.();
      containerRef.current?.releasePointerCapture(event.pointerId);
      gestureRef.current = null;
    }
  };

  const resetGesture = (event: PointerEvent<HTMLDivElement>) => {
    if (gestureRef.current) {
      containerRef.current?.releasePointerCapture(event.pointerId);
    }
    hideGuide();
    if (gestureRef.current?.type === "fold") {
      if (disabledFold) {
        gestureRef.current = null;
        return;
      }
      if (!folded) setFoldLift(0);
      gestureRef.current = null;
      return;
    }

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
  const shiftTransform = shifted
    ? "translateX(7rem) translateY(1rem)"
    : "translateX(0) translateY(0)";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-62 w-full touch-none select-none items-center justify-evenly rounded-md border-2 bg-orange-50 dark:bg-orange-950/60",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={resetGesture}
      onPointerCancel={resetGesture}
    >
      {!locked && showGuide && (
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-1/2 w-1/2 animate-pulse rounded-md border-2 border-teal-400/70 border-dashed bg-teal-200/20">
          <ArrowBigUpDash
            size={40}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-60 text-teal-500"
          />
          <span className="absolute bottom-1 left-2 font-montserrat text-sm text-teal-500">
            Swipe start
          </span>
        </div>
      )}

      <div
        className="relative top-1 transform transition-transform duration-200"
        style={{
          transform: `${shiftTransform} translateY(${-foldLift}px)`,
        }}
      >
        <div className="relative top-0 -left-8 z-10 rotate-6">
          <FlipCard progress={flipProgress} rs={hand1} />
        </div>
        <div className="absolute top-0 left-2 -rotate-5">
          <FlipCard progress={flipProgress} rs={hand2} />
        </div>
        {/* guide */}
        <div
          className={cn(
            "pointer-events-none absolute right-24 bottom-3 z-10 flex h-16 rotate-6 flex-col justify-center gap-y-1",
            locked
              ? "opacity-100 transition-opacity delay-2000"
              : "opacity-0 transition-none",
            (folded || disabledFold) && "hidden",
          )}
        >
          <ArrowBigUpDash
            size={32}
            className="animate-bounce text-gray-400 dark:text-gray-600"
          />
          <span className="text-gray-400 text-sm dark:text-gray-600">Fold</span>
        </div>
      </div>
      {folded && (
        <div className="absolute right-4 bottom-3 rounded-full border bg-background/30 px-8 py-1 text-foreground/70">
          Fold
        </div>
      )}
    </div>
  );
};

const FlipCard = ({ rs, progress }: { rs: string; progress: number }) => {
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
          <PlayCard size="lg" rs={rs} />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
          <PlayCard size="lg" />
        </div>
      </div>
    </div>
  );
};

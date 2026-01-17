"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SUIT_MATCH_EVENT,
  type SuitMatchEventDetail,
} from "./suit-confetti-events";

type Suit = "s" | "h" | "d" | "c";

type ConfettiPiece = {
  left: string;
  apexDrift: string;
  endDrift: string;
  apexY: string;
  endY: string;
  rotate: string;
  rotateHalf: string;
  delay: string;
  duration: string;
  size: string;
  radius: string;
  className: string;
};

type FallPiece = {
  left: string;
  drift: string;
  rotate: string;
  delay: string;
  duration: string;
  size: string;
  radius: string;
  className: string;
};

const SUITS: Suit[] = ["s", "h", "d", "c"];
const CONFETTI_COLORS = [
  "bg-suit-spade",
  "bg-suit-heart",
  "bg-suit-diamond",
  "bg-suit-club",
];

const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const createConfettiPieces = (count: number): ConfettiPiece[] =>
  Array.from({ length: count }, () => {
    const left = `${randInt(6, 94)}%`;
    const apexDrift = `${randInt(-6, 6)}vw`;
    const endDrift = `${randInt(-10, 10)}vw`;
    const apexHeight = randInt(110, 130);
    const endHeight = randInt(150, 180);
    const rotate = randInt(360, 720);
    const rotateHalf = Math.round(rotate / 2);
    const duration = randInt(2400, 3000);
    const delay = randInt(0, 240);
    const size = randInt(4, 7);
    const radius = Math.random() > 0.7 ? "999px" : "2px";
    const color =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ??
      CONFETTI_COLORS[0];

    return {
      left,
      apexDrift,
      endDrift,
      apexY: `-${apexHeight}vh`,
      endY: `-${endHeight}vh`,
      rotate: `${rotate}deg`,
      rotateHalf: `${rotateHalf}deg`,
      delay: `${delay}ms`,
      duration: `${duration}ms`,
      size: `${size}px`,
      radius,
      className: color,
    };
  });

const createConfettiSet = () => createConfettiPieces(36);

const createFallPieces = (count: number): FallPiece[] =>
  Array.from({ length: count }, () => {
    const left = `${randInt(3, 97)}%`;
    const drift = `${randInt(-12, 12)}vw`;
    const rotate = `${randInt(90, 260)}deg`;
    const duration = `${randInt(5200, 7800)}ms`;
    const delay = `${randInt(0, 900)}ms`;
    const size = `${randInt(4, 7)}px`;
    const radius = Math.random() > 0.7 ? "999px" : "2px";
    const color =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ??
      CONFETTI_COLORS[0];

    return {
      left,
      drift,
      rotate,
      delay,
      duration,
      size,
      radius,
      className: color,
    };
  });

export const SuitConfettiOverlay = () => {
  const [matches, setMatches] = useState<Record<Suit, boolean>>({
    s: false,
    h: false,
    d: false,
    c: false,
  });
  const [burstId, setBurstId] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [fallActive, setFallActive] = useState(false);
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [fallPieces, setFallPieces] = useState<FallPiece[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const fallTimeoutRef = useRef<number | null>(null);
  const fallEndTimeoutRef = useRef<number | null>(null);
  const prevAllCorrect = useRef(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<SuitMatchEventDetail>).detail;
      if (!detail) return;
      setMatches((prev) => ({
        ...prev,
        [detail.suit]: detail.isCorrect,
      }));
    };

    window.addEventListener(SUIT_MATCH_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(SUIT_MATCH_EVENT, handler as EventListener);
    };
  }, []);

  useEffect(() => {
    const allCorrect = SUITS.every((suit) => matches[suit]);
    if (allCorrect && !prevAllCorrect.current) {
      setPieces(createConfettiSet());
      setFallPieces(createFallPieces(40));
      setBurstId((prev) => prev + 1);
      setBurstActive(true);
      setFallActive(false);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (fallTimeoutRef.current) {
        window.clearTimeout(fallTimeoutRef.current);
      }
      if (fallEndTimeoutRef.current) {
        window.clearTimeout(fallEndTimeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setBurstActive(false);
      }, 3000);
      fallTimeoutRef.current = window.setTimeout(() => {
        setFallActive(true);
      }, 1200);
      fallEndTimeoutRef.current = window.setTimeout(() => {
        setFallActive(false);
      }, 9000);
    }
    prevAllCorrect.current = allCorrect;
  }, [matches]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (fallTimeoutRef.current) {
        window.clearTimeout(fallTimeoutRef.current);
      }
      if (fallEndTimeoutRef.current) {
        window.clearTimeout(fallEndTimeoutRef.current);
      }
    };
  }, []);

  if (!burstActive && !fallActive) return null;

  return (
    <>
      {burstActive && (
        <div
          key={`burst-${burstId}`}
          className="pointer-events-none fixed inset-0 z-10"
        >
          {pieces.map((piece, index) => (
            <span
              key={`cross-${burstId + index}`}
              className={cn(
                "confetti-piece",
                "confetti-cross",
                piece.className,
              )}
              style={
                {
                  "--confetti-left": piece.left,
                  "--confetti-apex-drift": piece.apexDrift,
                  "--confetti-end-drift": piece.endDrift,
                  "--confetti-apex-y": piece.apexY,
                  "--confetti-end-y": piece.endY,
                  "--confetti-rotate": piece.rotate,
                  "--confetti-rotate-half": piece.rotateHalf,
                  "--confetti-delay": piece.delay,
                  "--confetti-duration": piece.duration,
                  "--confetti-size": piece.size,
                  "--confetti-radius": piece.radius,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      {fallActive && (
        <div
          key={`fall-${burstId}`}
          className="pointer-events-none fixed inset-0 -z-10 bg-background"
        >
          {fallPieces.map((piece, index) => (
            <span
              key={`fall-${burstId + index}`}
              className={cn("confetti-piece", "confetti-fall", piece.className)}
              style={
                {
                  "--confetti-left": piece.left,
                  "--confetti-drift": piece.drift,
                  "--confetti-rotate": piece.rotate,
                  "--confetti-delay": piece.delay,
                  "--confetti-duration": piece.duration,
                  "--confetti-size": piece.size,
                  "--confetti-radius": piece.radius,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </>
  );
};

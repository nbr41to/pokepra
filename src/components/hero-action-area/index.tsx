"use client";

import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionAreaContainer } from "./components/action-area-container";
import { ActionGuide } from "./components/action-guide";
import { FoldBadge } from "./components/fold-badge";
import { FoldGuide } from "./components/fold-guide";
import { HandCards } from "./components/hand-cards";
import { SwipeGuide } from "./components/swipe-guide";
import { ACTION_GUIDE_DELAY_MS, AUTO_COMPLETE_THRESHOLD } from "./constants";
import { useDoubleTap } from "./hooks/use-double-tap";
import { useSwipeGuide } from "./hooks/use-swipe-guide";
import { clamp, isInFoldZone, isInStartZone } from "./utils/geometry";

/**
 * Preflopのカードを確認するためのUI
 */
export type HeroActionAreaProps = {
  hand: string[];
  onOpenHand: () => void;
  doubleTapActionName?: string;
  onDoubleTap?: () => void;
  disabled?: boolean;
  onFold?: () => void;
  className?: string;
};

type GestureState = {
  startX: number;
  startY: number;
  type: "flip" | "fold";
};

export const HeroActionArea = ({
  hand,
  onOpenHand,
  doubleTapActionName,
  onDoubleTap,
  disabled = false, // TODO: fold機能を無効化するオプション
  onFold,
  className,
}: HeroActionAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [locked, setLocked] = useState(false);
  const [shifted, setShifted] = useState(false);
  const [folded, setFolded] = useState(false);
  const [foldLift, setFoldLift] = useState(0);
  const [showActionGuide, setShowActionGuide] = useState(false);
  const gestureRef = useRef<GestureState | null>(null);
  const actionGuideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { showGuide, hideGuide } = useSwipeGuide({
    locked,
    flipProgress,
    disabled,
  });
  const registerDoubleTap = useDoubleTap(onDoubleTap);
  const foldEnabled = Boolean(onFold) && !disabled;

  const triggerOpenHand = useCallback(() => {
    if (disabled) return;
    setLocked(true);
    onOpenHand();
  }, [disabled, onOpenHand]);

  const finalizeOpenHand = useCallback(() => {
    setFlipProgress(1);
    triggerOpenHand();
  }, [triggerOpenHand]);

  const triggerFold = useCallback(
    (requiredLift: number) => {
      if (disabled) return;
      setFolded(true);
      setFoldLift(requiredLift);
      onFold?.();
    },
    [disabled, onFold],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      hideGuide();
      if (event.pointerType !== "touch") return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (locked && flipProgress >= 1) {
        registerDoubleTap(x, y, event.timeStamp);
      }

      // Allow fold gesture only after cards are opened
      if (locked && flipProgress >= 1 && !folded && foldEnabled) {
        if (isInFoldZone(rect, x, y)) {
          gestureRef.current = { startX: x, startY: y, type: "fold" };
          containerRef.current?.setPointerCapture(event.pointerId);
        }
        return;
      }

      if (locked) return;
      if (!isInStartZone(rect, x, y)) return;

      gestureRef.current = { startX: x, startY: y, type: "flip" };
      containerRef.current?.setPointerCapture(event.pointerId);
    },
    [disabled, flipProgress, foldEnabled, folded, hideGuide, locked, registerDoubleTap],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
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
          triggerOpenHand();
        }
        return;
      }

      if (!foldEnabled) return;

      const y = event.clientY - rect.top;
      const deltaY = gestureRef.current.startY - y;
      const requiredLift = rect.height * 0.3;
      const lift = clamp(deltaY, 0, requiredLift);
      setFoldLift(lift);
      if (deltaY >= requiredLift && !folded) {
        triggerFold(requiredLift);
        containerRef.current?.releasePointerCapture(event.pointerId);
        gestureRef.current = null;
      }
    },
    [disabled, foldEnabled, folded, hideGuide, locked, triggerFold, triggerOpenHand],
  );

  const resetGesture = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (gestureRef.current) {
        containerRef.current?.releasePointerCapture(event.pointerId);
      }
      hideGuide();
      if (gestureRef.current?.type === "fold") {
        if (!foldEnabled) {
          gestureRef.current = null;
          return;
        }
        if (!folded) setFoldLift(0);
        gestureRef.current = null;
        return;
      }

      if (!locked) {
        if (flipProgress >= AUTO_COMPLETE_THRESHOLD) {
          finalizeOpenHand();
        } else {
          setFlipProgress(0);
        }
      }
      gestureRef.current = null;
    },
    [disabled, finalizeOpenHand, flipProgress, foldEnabled, folded, hideGuide, locked],
  );

  useEffect(() => {
    if (actionGuideTimerRef.current) {
      clearTimeout(actionGuideTimerRef.current);
      actionGuideTimerRef.current = null;
    }

    if (disabled) {
      setShowActionGuide(false);
      return;
    }

    if (locked && flipProgress >= 1) {
      actionGuideTimerRef.current = setTimeout(() => {
        setShowActionGuide(true);
      }, ACTION_GUIDE_DELAY_MS);
    } else {
      setShowActionGuide(false);
    }

    return () => {
      if (actionGuideTimerRef.current) {
        clearTimeout(actionGuideTimerRef.current);
        actionGuideTimerRef.current = null;
      }
    };
  }, [disabled, locked, flipProgress]);

  useEffect(() => {
    if (locked && flipProgress >= 1) {
      setShifted(true);
    } else {
      setShifted(false);
    }
  }, [locked, flipProgress]);

  if (hand.length !== 2) return null;

  return (
    <ActionAreaContainer
      ref={containerRef}
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={resetGesture}
      onPointerCancel={resetGesture}
    >
      <ActionGuide
        visible={showActionGuide && !disabled}
        showFold={foldEnabled}
        showDoubleTap={Boolean(onDoubleTap) && !disabled}
        doubleTapActionName={doubleTapActionName}
      />
      <SwipeGuide visible={!locked && showGuide && !disabled} />
      <HandCards
        hand={hand}
        flipProgress={flipProgress}
        foldLift={foldLift}
        shifted={shifted}
      >
        <FoldGuide
          locked={locked}
          folded={folded}
          disabled={disabled}
          showFold={Boolean(onFold)}
        />
      </HandCards>
      <FoldBadge visible={folded} />
    </ActionAreaContainer>
  );
};

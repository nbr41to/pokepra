"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GUIDE_DELAY_MS } from "../constants";

type SwipeGuideOptions = {
  locked: boolean;
  flipProgress: number;
  disabled?: boolean;
};

type SwipeGuideState = {
  showGuide: boolean;
  hideGuide: () => void;
};

export const useSwipeGuide = ({
  locked,
  flipProgress,
  disabled = false,
}: SwipeGuideOptions): SwipeGuideState => {
  const [showGuide, setShowGuide] = useState(false);
  const guideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearGuideTimer = useCallback(() => {
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
  }, []);

  const resetGuideTimer = useCallback(() => {
    clearGuideTimer();
    setShowGuide(false);
    guideTimerRef.current = setTimeout(
      () => setShowGuide(true),
      GUIDE_DELAY_MS,
    );
  }, [clearGuideTimer]);

  const hideGuide = useCallback(() => {
    // Keep guide visible until cards are opened
    if (!locked && flipProgress < 1) return;
    clearGuideTimer();
    setShowGuide(false);
  }, [clearGuideTimer, flipProgress, locked]);

  useEffect(() => {
    if (disabled) {
      clearGuideTimer();
      setShowGuide(false);
      return;
    }
    resetGuideTimer();
    return () => {
      clearGuideTimer();
    };
  }, [disabled, resetGuideTimer, clearGuideTimer]);

  return { showGuide, hideGuide };
};

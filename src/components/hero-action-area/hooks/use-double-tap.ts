"use client";

import { useCallback, useRef } from "react";
import {
  DOUBLE_TAP_MAX_DISTANCE,
  DOUBLE_TAP_MAX_INTERVAL_MS,
} from "../constants";

type DoubleTapHandler = (x: number, y: number, timeStamp: number) => void;

type DoubleTapState = {
  time: number;
  x: number;
  y: number;
} | null;

export const useDoubleTap = (onDoubleTap?: () => void): DoubleTapHandler => {
  const lastTapRef = useRef<DoubleTapState>(null);

  return useCallback(
    (x, y, timeStamp) => {
      if (!onDoubleTap) return;

      const lastTap = lastTapRef.current;
      if (
        lastTap &&
        timeStamp - lastTap.time <= DOUBLE_TAP_MAX_INTERVAL_MS &&
        Math.hypot(x - lastTap.x, y - lastTap.y) <= DOUBLE_TAP_MAX_DISTANCE
      ) {
        lastTapRef.current = null;
        onDoubleTap();
      } else {
        lastTapRef.current = { time: timeStamp, x, y };
      }
    },
    [onDoubleTap],
  );
};

"use client";

import { useCallback } from "react";
import type { HapticInput, TriggerOptions } from "web-haptics";

type VibrationUnit = {
  duration: number;
  delay?: number;
};

type VibrationResult = {
  pattern: number | number[];
  fallbackClicks: number;
};

const fallbackInputId = "pokepra-haptic-fallback";

const presetPatterns: Record<string, VibrationUnit[]> = {
  success: [{ duration: 30 }, { delay: 60, duration: 40 }],
  warning: [{ duration: 40 }, { delay: 100, duration: 40 }],
  error: [
    { duration: 40 },
    { delay: 40, duration: 40 },
    { delay: 40, duration: 40 },
  ],
  light: [{ duration: 20 }],
  medium: [{ duration: 35 }],
  heavy: [{ duration: 50 }],
  soft: [{ duration: 30 }],
  rigid: [{ duration: 20 }],
  selection: [{ duration: 20 }],
  nudge: [{ duration: 60 }, { delay: 70, duration: 40 }],
  buzz: [{ duration: 200 }],
};

const isNumberPattern = (input: HapticInput): input is number[] =>
  Array.isArray(input) && (input.length === 0 || typeof input[0] === "number");

const normalizeInput = (input?: HapticInput): VibrationUnit[] => {
  if (input === undefined) return presetPatterns.medium;
  if (typeof input === "number") return [{ duration: input }];
  if (typeof input === "string")
    return presetPatterns[input] ?? presetPatterns.medium;
  if (Array.isArray(input)) {
    const vibrations = input as VibrationUnit[];
    return vibrations.map(({ delay, duration }) => ({ delay, duration }));
  }
  return input.pattern.map(({ delay, duration }) => ({ delay, duration }));
};

const normalizeNumberPattern = (
  pattern: number[],
  intensity: number,
): number[] =>
  pattern
    .map((duration, index) =>
      index % 2 === 0 ? duration * intensity : duration,
    )
    .map((duration) => Math.max(0, Math.round(duration)))
    .filter((duration, index) => index % 2 === 1 || duration > 0);

export const createVibrationPattern = (
  input?: HapticInput,
  options?: TriggerOptions,
): VibrationResult => {
  const intensity = Math.max(0, Math.min(1, options?.intensity ?? 1));
  if (input !== undefined && isNumberPattern(input)) {
    const pattern = normalizeNumberPattern(input, intensity);
    return {
      pattern: pattern.length === 1 ? pattern[0] : pattern,
      fallbackClicks: Math.min(Math.ceil(pattern.length / 2), 3),
    };
  }

  const units = normalizeInput(input)
    .map(({ delay = 0, duration }) => ({
      delay: Math.max(0, Math.round(delay)),
      duration: Math.max(0, Math.round(duration * intensity)),
    }))
    .filter(({ duration }) => Number.isFinite(duration) && duration > 0);

  if (units.length === 0) return { pattern: 0, fallbackClicks: 0 };

  const pattern = units.flatMap(({ delay, duration }, index) =>
    index === 0 ? [duration] : [delay, duration],
  );

  return {
    pattern: pattern.length === 1 ? pattern[0] : pattern,
    fallbackClicks: Math.min(units.length, 3),
  };
};

const ensureFallbackInput = () => {
  if (typeof document === "undefined") return null;

  const existing = document.getElementById(
    fallbackInputId,
  ) as HTMLInputElement | null;
  if (existing) return existing;

  const input = document.createElement("input");
  input.id = fallbackInputId;
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.setAttribute("aria-hidden", "true");
  input.tabIndex = -1;
  input.style.position = "fixed";
  input.style.left = "-9999px";
  input.style.bottom = "0";
  input.style.width = "1px";
  input.style.height = "1px";
  input.style.opacity = "0";
  input.style.pointerEvents = "none";
  document.body.appendChild(input);
  return input;
};

export const useVibration = () => {
  const trigger = useCallback(
    (input?: HapticInput, options?: TriggerOptions) => {
      const { pattern, fallbackClicks } = createVibrationPattern(
        input,
        options,
      );
      const vibrate =
        typeof navigator === "undefined"
          ? undefined
          : navigator.vibrate?.bind(navigator);

      if (vibrate?.(pattern)) return;

      const fallback = ensureFallbackInput();
      for (let i = 0; i < fallbackClicks; i++) {
        fallback?.click();
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    if (typeof navigator === "undefined") return;
    navigator.vibrate?.(0);
  }, []);

  return {
    trigger,
    cancel,
    isSupported:
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function",
  };
};

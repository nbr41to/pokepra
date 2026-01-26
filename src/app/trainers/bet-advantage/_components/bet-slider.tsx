"use client";

import { ChevronsLeftRight } from "lucide-react";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export const BetSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const draggingRef = useRef(false);
  const [arcTotalLength, setArcTotalLength] = useState(0);

  const size = 80;
  const padding = 12;
  const radius = size - padding * 2;
  const centerX = padding;
  const centerY = padding;
  const range = Math.max(max - min, 1);
  const clampedValue = clamp(value, min, max);
  const t = clamp((clampedValue - min) / range, 0, 1);
  const angle = (1 - t) * (Math.PI / 2);
  const fallbackKnobX = centerX + Math.cos(angle) * radius;
  const fallbackKnobY = centerY + Math.sin(angle) * radius;
  const rotation = t * 80;
  const arcLength = (Math.PI / 2) * radius;

  const arcPath = `M ${centerX} ${centerY + radius} A ${radius} ${radius} 0 0 1 ${
    centerX + radius
  } ${centerY}`;

  useEffect(() => {
    if (!arcRef.current) return;
    setArcTotalLength(arcRef.current.getTotalLength());
  }, []);

  const knobPoint =
    arcRef.current && arcTotalLength > 0
      ? arcRef.current.getPointAtLength(arcTotalLength * t)
      : null;
  const knobX = knobPoint?.x ?? fallbackKnobX;
  const knobY = knobPoint?.y ?? fallbackKnobY;

  const commitValue = useCallback(
    (next: number) => {
      const stepped =
        step > 0 ? Math.round((next - min) / step) * step + min : next;
      onChange(clamp(Number(stepped.toFixed(6)), min, max));
    },
    [max, min, onChange, step],
  );

  const getValueFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return null;
      const x = ((clientX - rect.left) / rect.width) * size;
      const y = ((clientY - rect.top) / rect.height) * size;
      const dx = x - centerX;
      const dy = y - centerY;
      const rawAngle = Math.atan2(dy, dx);
      const clampedAngle = clamp(rawAngle, 0, Math.PI / 2);
      const nextT = 1 - clampedAngle / (Math.PI / 2);
      return min + nextT * range;
    },
    [centerX, centerY, min, range],
  );

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const nextValue = getValueFromPointer(clientX, clientY);
      if (nextValue === null) return;
      commitValue(nextValue);
    },
    [commitValue, getValueFromPointer],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      const nextValue = getValueFromPointer(event.clientX, event.clientY);
      if (nextValue === null) return;
      if (step > 0) {
        const direction =
          nextValue === clampedValue ? 0 : nextValue > clampedValue ? 1 : -1;
        commitValue(clampedValue + direction * step);
        return;
      }
      commitValue(nextValue);
    },
    [clampedValue, commitValue, disabled, getValueFromPointer, step],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateFromPointer(event.clientX, event.clientY);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const precision = step < 1 ? 2 : 0;
  const displayValue = clampedValue.toFixed(precision);

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: Drag handling requires a div wrapper.
    <div
      ref={containerRef}
      className={cn(
        "relative size-44 touch-none select-none",
        disabled && "opacity-50",
        className,
      )}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clampedValue}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <path
          ref={arcRef}
          d={arcPath}
          fill="none"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke="url(#betArcGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - t)}
          className="dark:hidden"
        />
        <path
          d={arcPath}
          fill="none"
          stroke="url(#betArcGradientDark)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - t)}
          className="hidden dark:block"
        />
        <defs>
          <linearGradient
            id="betArcGradient"
            x1={centerX}
            y1={centerY + radius}
            x2={centerX + radius}
            y2={centerY}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="55%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient
            id="betArcGradientDark"
            x1={centerX}
            y1={centerY + radius}
            x2={centerX + radius}
            y2={centerY}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="55%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
      </svg>

      <div className="pointer-events-none absolute top-4 left-4 flex flex-col items-center justify-center gap-1">
        <span className="font-bold text-2xl text-foreground tabular-nums">
          {displayValue}
        </span>
      </div>

      <div
        className={cn(
          "absolute grid h-10 w-10 place-content-center rounded-full border border-gray-300 bg-linear-to-br from-gray-200 via-gray-100 to-gray-300 text-gray-700 text-xs shadow-[0_10px_18px_rgba(15,23,42,0.2)] transition-transform duration-150 dark:border-gray-600 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800 dark:text-gray-200",
          disabled ? "cursor-not-allowed" : "cursor-grab",
        )}
        style={{
          left: `${(knobX / size) * 100}%`,
          top: `${(knobY / size) * 100}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      >
        <ChevronsLeftRight size={24} className="rotate-100" />
      </div>

      <div className="pointer-events-none absolute bottom-1 left-3 text-muted-foreground text-xs">
        {min}
      </div>
      <div className="pointer-events-none absolute top-1 right-3 text-muted-foreground text-xs">
        {max}
      </div>
    </div>
  );
};

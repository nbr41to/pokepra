"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  stack: number;
  className?: string;
}

function SlotDigit({
  digit,
  delay = 0,
  isIncreasing,
}: {
  digit: number;
  delay?: number;
  isIncreasing: boolean | null;
}) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isSpinning, setIsSpinning] = useState(false);
  const prevDigitRef = useRef(digit);

  useEffect(() => {
    if (prevDigitRef.current !== digit) {
      setIsSpinning(true);

      // Start spinning animation
      const spinDuration = 500 + delay;
      const spinInterval = setInterval(() => {
        setDisplayDigit((prev) => (prev + 1) % 10);
      }, 50);

      // Stop at the correct digit
      setTimeout(() => {
        clearInterval(spinInterval);
        setDisplayDigit(digit);
        setIsSpinning(false);
        prevDigitRef.current = digit;
      }, spinDuration);

      return () => clearInterval(spinInterval);
    }
  }, [digit, delay]);

  return (
    <div className="relative h-5 w-3 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center font-bold text-xl tabular-nums transition-all duration-100",
          isSpinning && isIncreasing === true && "text-green-500",
          isSpinning && isIncreasing === false && "text-red-500",
          isSpinning && "animate-pulse",
        )}
      >
        {displayDigit}
      </div>
    </div>
  );
}

export function StackView({ stack, className }: Props) {
  const prevScoreRef = useRef(stack);
  const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);

  useEffect(() => {
    if (prevScoreRef.current !== stack) {
      setIsIncreasing(stack > prevScoreRef.current);
      prevScoreRef.current = stack;
    }
  }, [stack]);

  const digits = stack
    .toString()
    .replace(/^0+(?!$)/, "")
    .split("")
    .map(Number);

  return (
    <div className={cn("flex items-end gap-1", className)}>
      <div className="flex gap-px">
        {digits.map((digit, index) => (
          <SlotDigit
            // biome-ignore lint/suspicious/noArrayIndexKey: Digits are stable and ordered.
            key={index}
            digit={digit}
            // Right to left stop: last digit has 0 delay, first digit has max delay
            delay={(digits.length - 1 - index) * 150}
            isIncreasing={isIncreasing}
          />
        ))}
      </div>
      <span className="h-5 font-bold">pt</span>
    </div>
  );
}

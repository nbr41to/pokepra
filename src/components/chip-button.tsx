"use client";

import type React from "react";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PokerChipButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: "red" | "blue" | "green" | "black";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PokerChipButton({
  children,
  onClick,
  color = "red",
  size = "md",
  className,
}: PokerChipButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const colorClasses = {
    red: "bg-gradient-to-b from-red-500 via-red-600 to-red-700 border-red-800",
    blue: "bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 border-blue-800",
    green:
      "bg-gradient-to-b from-green-500 via-green-600 to-green-700 border-green-800",
    black:
      "bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 border-gray-950",
  };

  const sizeClasses = {
    sm: "w-16 h-16 text-sm",
    md: "w-24 h-24 text-base",
    lg: "w-32 h-32 text-lg",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={cn(
        "relative rounded-full font-bold text-white transition-all duration-150",
        "border-4 border-dashed",
        "focus:outline-none focus:ring-4 focus:ring-white/50",
        colorClasses[color],
        sizeClasses[size],
        isPressed
          ? "translate-y-1 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]"
          : "shadow-[0_6px_0_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.2)]",
        className,
      )}
      style={{
        boxShadow: isPressed
          ? "inset 0 4px 12px rgba(0,0,0,0.6)"
          : "0 6px 0 rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute inset-2 rounded-full border-2 border-white/30" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <span className="drop-shadow-lg">{children}</span>
      </div>
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { SuitIcon } from "@/components/suit-icon";
import { cn } from "@/lib/utils";
import {
  SUIT_MATCH_EVENT,
  type SuitMatchEventDetail,
} from "./suit-confetti-events";

type Props = {
  suit: "s" | "h" | "d" | "c";
};

export const SwitchSuitIcon = ({ suit }: Props) => {
  const [colorNames, setColorName] = useState(COLOR_CLASSES[0]);
  const correctColorClass = SUIT_COLOR_CLASS[suit];

  const switchColor = () => {
    const currentIndex = COLOR_CLASSES.findIndex(
      (c) => c.join() === colorNames.join(),
    );
    const nextIndex = (currentIndex + 1) % COLOR_CLASSES.length;
    const nextColors = COLOR_CLASSES[nextIndex];
    setColorName(nextColors);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const detail: SuitMatchEventDetail = {
      suit,
      isCorrect: colorNames.includes(correctColorClass),
    };
    window.dispatchEvent(new CustomEvent(SUIT_MATCH_EVENT, { detail }));
  }, [colorNames, correctColorClass, suit]);

  return (
    <SuitIcon
      data-suit={suit}
      className={cn(colorNames)}
      suit={suit}
      onClick={switchColor}
      fill="fill"
    />
  );
};

const SUIT_COLOR_CLASS = {
  s: "text-suit-spade",
  h: "text-suit-heart",
  d: "text-suit-diamond",
  c: "text-suit-club",
} as const;

const COLOR_CLASSES = [
  ["text-foreground", "fill-background"],
  ["text-suit-spade", "fill-suit-spade"],
  ["text-suit-heart", "fill-suit-heart"],
  ["text-suit-club", "fill-suit-club"],
  ["text-suit-diamond", "fill-suit-diamond"],
];

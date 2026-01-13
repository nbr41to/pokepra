import type { ReactNode } from "react";
import { FlipCard } from "./flip-card";

type HandCardsProps = {
  hand: string[];
  flipProgress: number;
  foldLift: number;
  shifted: boolean;
  children?: ReactNode;
};

export const HandCards = ({
  hand,
  flipProgress,
  foldLift,
  shifted,
  children,
}: HandCardsProps) => {
  const shiftTransform = shifted
    ? "translateX(7.5rem) translateY(1.2rem)"
    : "translateX(0) translateY(0)";

  return (
    <div
      className="relative top-1 transform transition-transform duration-200"
      style={{ transform: `${shiftTransform} translateY(${-foldLift}px)` }}
    >
      <div className="relative top-0 -left-8 z-10 rotate-6">
        <FlipCard progress={flipProgress} rs={hand[0]} />
      </div>
      <div className="absolute top-0 left-2 -rotate-5">
        <FlipCard progress={flipProgress} rs={hand[1]} />
      </div>
      {children}
    </div>
  );
};

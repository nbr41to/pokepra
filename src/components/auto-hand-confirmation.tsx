import { useEffect, useState } from "react";
import { PlayCard } from "./play-card";

type Props = {
  hand: string[];
  open: boolean;
};

export const AutoHandConfirmation = ({ hand, open }: Props) => {
  const [flipProgress, setFlipProgress] = useState(open ? 1 : 0);

  useEffect(() => {
    // open が true になったら表向きにスナップ（初期状態は裏面）
    setFlipProgress(open ? 1 : 0);
  }, [open]);

  const mapped = mapProgress(flipProgress);

  return (
    <div className="relative w-12">
      <MiniFlipCard
        className="relative -left-px -rotate-2"
        progress={mapped}
        suit={hand[0][1] as "c" | "d" | "h" | "s"}
        rank={hand[0].slice(0, -1)}
      />
      <MiniFlipCard
        className="absolute top-0 right-0 rotate-4"
        progress={mapped}
        suit={hand[1][1] as "c" | "d" | "h" | "s"}
        rank={hand[1].slice(0, -1)}
      />
    </div>
  );
};

const mapProgress = (value: number) => {
  const clamped = Math.min(Math.max(value, 0), 1);
  const breakpoint = 0.25;
  if (clamped <= breakpoint) return Math.min(clamped * 2, 1);
  const fastPortion = breakpoint * 2; // 0.5
  const remaining = (clamped - breakpoint) / (1 - breakpoint);
  return fastPortion + remaining * (1 - fastPortion);
};

const MiniFlipCard = ({
  suit,
  rank,
  progress,
  className,
}: {
  suit: "s" | "h" | "d" | "c";
  rank: string;
  progress: number;
  className?: string;
}) => {
  const rotation = 180 - progress * 180;
  return (
    <div className={className}>
      <div className="perspective-distant relative h-11 w-7">
        <div
          className="transform-3d relative h-full w-full transition-transform duration-150"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
          <div className="backface-hidden absolute inset-0 grid place-items-center">
            <PlayCard suit={suit} rank={rank} size="sm" />
          </div>
          <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
            <PlayCard size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

import { PlayCard } from "../../play-card";

type FlipCardProps = {
  rs: string;
  progress: number;
};

export const FlipCard = ({ rs, progress }: FlipCardProps) => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const accelerateStart = (value: number) => {
    const breakpoint = 0.25; // first quarter of the swipe
    if (value <= breakpoint) return Math.min(value * 2, 1); // 2x speed early
    const fastPortion = breakpoint * 2; // output at breakpoint (0.5)
    const remaining = (value - breakpoint) / (1 - breakpoint);
    return fastPortion + remaining * (1 - fastPortion); // linear remainder
  };
  const mappedProgress = accelerateStart(clamped);
  const rotation = 180 - mappedProgress * 180;

  return (
    <div className="perspective-distant relative h-42 w-32">
      <div
        className="transform-3d relative h-full w-full transition-transform duration-75"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <div className="backface-hidden absolute inset-0 grid place-items-center">
          <PlayCard size="lg" rs={rs} />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
          <PlayCard size="lg" />
        </div>
      </div>
    </div>
  );
};

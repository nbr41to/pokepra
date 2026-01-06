import { cn } from "@/lib/utils";
import { PlayCard } from "./play-card";

type Props = {
  hand: string[];
  reversed?: boolean;
  delay?: number;
};

export const OtherHand = ({ hand, reversed = true, delay }: Props) => {
  return (
    <div className="relative w-15">
      <FlipCard
        className="relative left-0 -rotate-4"
        rs={hand[0]}
        showFront={reversed}
        delay={delay}
      />
      <FlipCard
        className="absolute top-0 left-7 rotate-5"
        rs={hand[1]}
        showFront={reversed}
        delay={delay}
      />
    </div>
  );
};

const FlipCard = ({
  rs,
  showFront,
  className,
  delay,
}: {
  rs: string;
  showFront: boolean;
  delay?: number;
  className?: string;
}) => {
  const rotation = showFront ? 0 : 180;

  return (
    <div className={cn("perspective-distant relative h-11 w-8", className)}>
      <div
        className={cn(
          "transform-3d relative h-full w-full ease-out",
          !showFront
            ? "animate-none transition-none duration-0"
            : "transition-transform duration-300",
        )}
        style={{
          transform: `rotateY(${rotation}deg)`,
          transitionDelay: delay ? `${delay}ms` : undefined,
        }}
      >
        <div className="backface-hidden absolute inset-0 grid place-items-center">
          <PlayCard rs={rs} size="sm" />
        </div>
        <div className="backface-hidden transform-[rotateY(180deg)] absolute inset-0 grid place-items-center">
          <PlayCard size="sm" />
        </div>
      </div>
    </div>
  );
};

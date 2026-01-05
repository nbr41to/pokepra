import { PlayCard } from "./play-card";

type Props = {
  hand: string[];
  size?: "sm" | "md";
};

export const Combo = ({ hand, size = "sm" }: Props) => {
  return (
    <div className="relative w-12 scale-75">
      <PlayCard
        className="relative -left-px -rotate-2"
        rank={hand[0][0]}
        suit={hand[0][1] as "c" | "d" | "h" | "s"}
        size={size}
      />
      <PlayCard
        className="absolute top-0 right-0 rotate-4"
        rank={hand[1][0]}
        suit={hand[1][1] as "c" | "d" | "h" | "s"}
        size={size}
      />
    </div>
  );
};

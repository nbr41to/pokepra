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
        rs={hand[0]}
        size={size}
      />
      <PlayCard
        className="absolute top-0 right-0 rotate-4"
        rs={hand[1]}
        size={size}
      />
    </div>
  );
};

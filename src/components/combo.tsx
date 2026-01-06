import { cn } from "@/lib/utils";
import { PlayCard } from "./play-card";

type Props = {
  hand: string[];
  className?: string;
};

export const Combo = ({ hand, className }: Props) => {
  return (
    <div className={cn("relative w-15", className)}>
      <PlayCard className="relative -left-2 -rotate-4" rs={hand[0]} size="sm" />
      <PlayCard
        className="absolute top-0 left-5 rotate-5"
        rs={hand[1]}
        size="sm"
      />
    </div>
  );
};

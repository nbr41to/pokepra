import { Club, Diamond, Heart, type LucideProps, Spade } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUIT, type Suit } from "@/utils/v2/card";

type Props = {
  suit: Suit;
  className?: string;
} & Omit<LucideProps, "ref">;

export const SuitIcon = ({ suit, className, ...props }: Props) => {
  return (
    <>
      <Spade
        className={cn(suit !== SUIT.SPADE && "hidden", className)}
        {...props}
      />
      <Heart
        className={cn(suit !== SUIT.HEART && "hidden", className)}
        {...props}
      />
      <Diamond
        className={cn(suit !== SUIT.DIAMOND && "hidden", className)}
        {...props}
      />
      <Club
        className={cn(suit !== SUIT.CLUB && "hidden", className)}
        {...props}
      />
    </>
  );
};

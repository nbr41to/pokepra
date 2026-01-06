import { Club, Diamond, Heart, type LucideProps, Spade } from "lucide-react";

type Props = {
  suit: "s" | "h" | "d" | "c";
  className?: string;
} & Omit<LucideProps, "ref">;

export const SuitIcon = ({ suit, ...props }: Props) => {
  switch (suit) {
    case "s":
      return <Spade {...props} />;
    case "h":
      return <Heart {...props} />;
    case "d":
      return <Diamond {...props} />;
    case "c":
      return <Club {...props} />;
  }
};

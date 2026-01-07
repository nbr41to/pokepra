import { Club, Diamond, Heart, type LucideProps, Spade } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  suit: "s" | "h" | "d" | "c";
  className?: string;
} & Omit<LucideProps, "ref">;

export const SuitIcon = ({ suit, ...props }: Props) => {
  return (
    <>
      <Spade className={cn(suit !== "s" && "hidden")} {...props} />
      <Heart className={cn(suit !== "h" && "hidden")} {...props} />
      <Diamond className={cn(suit !== "d" && "hidden")} {...props} />
      <Club className={cn(suit !== "c" && "hidden")} {...props} />
    </>
  );
};

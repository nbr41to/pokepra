import { Club, Diamond, Heart, type LucideProps, Spade } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  suit: "s" | "h" | "d" | "c";
  className?: string;
} & Omit<LucideProps, "ref">;

export const SuitIcon = ({ suit, className, ...props }: Props) => {
  return (
    <>
      <Spade className={cn(suit !== "s" && "hidden", className)} {...props} />
      <Heart className={cn(suit !== "h" && "hidden", className)} {...props} />
      <Diamond className={cn(suit !== "d" && "hidden", className)} {...props} />
      <Club className={cn(suit !== "c" && "hidden", className)} {...props} />
    </>
  );
};

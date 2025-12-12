import { cn } from "@/lib/utils";
import { SuitIcon } from "./suit-icon";
import { Grape } from "lucide-react";

type Props = {
  suit?: "s" | "h" | "d" | "c";
  rank?: string;
};

export const PlayCard = ({ suit, rank }: Props) => {
  const reversed = !suit || !rank;

  return (
    <div
      className={cn(
        "w-20 h-28 p-1 bg-foreground/10 border-2 border-foreground/80 rounded-md grid place-items-center",
        suit === "s" && "text-blue-400",
        suit === "h" && "text-pink-400",
        suit === "d" && "text-orange-400",
        suit === "c" && "text-green-400"
      )}
    >
      {reversed ? (
        <Grape size={48} strokeWidth={2.5} />
      ) : (
        <>
          <SuitIcon suit={suit} size={48} strokeWidth={2.5} />
          <span className="font-bold text-4xl">{rank}</span>
        </>
      )}
    </div>
  );
};

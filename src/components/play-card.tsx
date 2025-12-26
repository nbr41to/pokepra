import { Grape } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitIcon } from "./suit-icon";

type Props = {
  suit?: "s" | "h" | "d" | "c";
  rank?: string;
};

export const PlayCard = ({ suit, rank }: Props) => {
  const reversed = !suit || !rank;

  return (
    <div
      className={cn(
        "h-42 w-32 rounded-md border-2 bg-background p-1",
        suit === "s" && "text-blue-400",
        suit === "h" && "text-pink-400",
        suit === "d" && "text-orange-400",
        suit === "c" && "text-green-400",
        reversed ? "grid place-items-center" : "relative",
      )}
    >
      {reversed ? (
        <Grape
          size={100}
          strokeWidth={1.5}
          className="text-indigo-500 dark:text-indigo-900"
        />
      ) : (
        <div className="absolute bottom-0 left-0 grid place-items-center p-1">
          <SuitIcon suit={suit} size={36} strokeWidth={3} />
          <span className="font-bold font-montserrat text-4xl">{rank}</span>
        </div>
      )}
    </div>
  );
};

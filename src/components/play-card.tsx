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
        "grid h-22 w-16 place-items-center rounded-md border-2 bg-background p-1",
        suit === "s" && "text-blue-400 dark:text-blue-600",
        suit === "h" && "text-pink-400 dark:text-pink-600",
        suit === "d" && "text-orange-400 dark:text-orange-600",
        suit === "c" && "text-green-400 dark:text-green-600",
      )}
    >
      {reversed ? (
        <Grape
          size={54}
          strokeWidth={1.5}
          className="text-indigo-500 dark:text-indigo-900"
        />
      ) : (
        <>
          <SuitIcon suit={suit} size={36} strokeWidth={2.5} />
          <span className="font-bold font-montserrat text-3xl">{rank}</span>
        </>
      )}
    </div>
  );
};

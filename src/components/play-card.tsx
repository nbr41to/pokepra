import { Grape } from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitIcon } from "./suit-icon";

type Props = {
  suit?: "s" | "h" | "d" | "c";
  rank?: string;
  size?: "sm" | "md";
};

export const PlayCard = ({ suit, rank, size = "md" }: Props) => {
  const reversed = !suit || !rank;

  const cardSizeClass =
    size === "sm"
      ? "h-11 w-7 p-px border rounded"
      : "h-22 w-16 p-1 rounded-md border-2";
  const designSize = size === "sm" ? 24 : 54;
  const suitSize = size === "sm" ? 16 : 36;
  const rankFontSizeClass = size === "sm" ? "text-sm/[1]" : "text-3xl";

  return (
    <div
      className={cn(
        cardSizeClass,
        "grid place-items-center bg-background",
        suit === "s" && "text-blue-400 dark:text-blue-600",
        suit === "h" && "text-pink-400 dark:text-pink-600",
        suit === "d" && "text-orange-400 dark:text-orange-600",
        suit === "c" && "text-green-400 dark:text-green-600",
      )}
    >
      {reversed ? (
        <Grape
          size={designSize}
          strokeWidth={1.5}
          className="text-indigo-500 dark:text-indigo-900"
        />
      ) : (
        <>
          <SuitIcon suit={suit} size={suitSize} strokeWidth={2.5} />
          <span className={cn("font-bold font-montserrat", rankFontSizeClass)}>
            {rank}
          </span>
        </>
      )}
    </div>
  );
};

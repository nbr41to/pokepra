import { cn } from "@/lib/utils";
import { useFullStreetDefenseStore } from "./_utils/state";

export const ResultArea = () => {
  const { street, delta, finished, action } = useFullStreetDefenseStore();

  if (!action) {
    return <div className="h-8" />;
  }

  return (
    <div className="relative flex h-8 select-none items-end justify-center">
      <span
        key={street + delta + action}
        className={cn(
          "inline-block origin-top animate-score-bounce font-bold text-2xl",
          delta > 0 ? "text-green-500" : "text-red-500",
          delta === 0 && "text-muted-foreground",
        )}
      >
        {finished && action === "fold"
          ? "Fold"
          : delta >= 0
            ? `+${delta}`
            : delta}
        {finished && action !== "fold" ? " BB" : ""}
      </span>
    </div>
  );
};

import { cn } from "@/lib/utils";
import { useOffenseStore } from "./_utils/state";

export const ResultArea = () => {
  const { action, finished, delta, resultText } = useOffenseStore();

  if (!action) {
    return <div className="h-8" />;
  }

  return (
    <div className="flex h-8 items-end justify-center gap-2">
      <span className="text-muted-foreground text-sm">{resultText}</span>
      <span
        key={`${action}-${delta}`}
        className={cn(
          "inline-block origin-top animate-score-bounce font-bold text-2xl",
          !finished && "text-muted-foreground",
          delta > 0 && "text-green-500",
          delta < 0 && "text-red-500",
        )}
      >
        {delta > 0 ? "+" : ""}
        {delta} BB
      </span>
    </div>
  );
};

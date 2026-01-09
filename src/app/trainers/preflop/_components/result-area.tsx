import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

export const ResultArea = () => {
  const { hero, delta, preflop } = useActionStore();

  if (hero.length === 0 || !preflop) return <div className="h-12" />;

  return (
    <span
      key={delta}
      className={cn(
        "inline-block origin-bottom animate-score-bounce font-bold text-2xl",
        delta > 0 ? "text-green-500" : "text-red-500",
        delta === 0 && "hidden",
      )}
    >
      {delta > 0 ? "+" : ""}
      {delta}pt
    </span>
  );
};

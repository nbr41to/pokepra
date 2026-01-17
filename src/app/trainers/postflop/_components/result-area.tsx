import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

export const ResultArea = () => {
  const { street, delta } = useActionStore();

  return (
    <div className="relative flex h-8 select-none items-end justify-center">
      <span
        key={street + delta} // deltaが変わるたびにアニメーションを再実行するためのkey
        className={cn(
          "inline-block origin-top animate-score-bounce font-bold text-2xl",
          delta > 0 ? "text-green-500" : "text-red-500",
          delta === 0 && "hidden",
        )}
      >
        {delta > 0 ? "+" : ""}
        {delta}pt
      </span>
    </div>
  );
};

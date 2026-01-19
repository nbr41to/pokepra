import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";

type Props = {
  className?: string;
};
export const ResultArea = ({ className }: Props) => {
  const { stack, hero, delta, preflop } = useActionStore();

  return (
    <div className="relative flex justify-end">
      {!(hero.length === 0 || !preflop) && (
        <span
          key={delta}
          className={cn(
            "absolute right-4 bottom-6 inline-block origin-bottom animate-score-bounce font-bold text-2xl",
            delta > 0 ? "text-green-500" : "text-red-500",
            delta === 0 && "hidden",
            className,
          )}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      )}
      <StackView className="" stack={stack} />
    </div>
  );
};

import { StackView } from "@/components/stack-view";
import { cn } from "@/lib/utils";
import { useOpenRaiseVsBbStore } from "./_utils/state";

export const ResultArea = () => {
  const { street, stack, delta, actions, pot } = useOpenRaiseVsBbStore();
  const hasPostflopAction = Boolean(
    actions.flop || actions.turn || actions.river,
  );
  const potLabel = Number.isInteger(pot) ? pot.toFixed(0) : pot.toFixed(1);

  return (
    <div className="flex h-15 flex-col items-end justify-end gap-y-2">
      {hasPostflopAction && (
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
      )}
      <div className="text-muted-foreground text-xs">Pot {potLabel} BB</div>
      <StackView stack={stack} />
    </div>
  );
};

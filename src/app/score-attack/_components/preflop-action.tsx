import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionStore } from "../_utils/state";

export const PreflopAction = () => {
  const { preflop, preflopAction, switchNextPhase } = useActionStore();

  const handleNext = () => {
    switchNextPhase();
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex w-fit gap-x-4 rounded-md border-2 border-green-400 bg-background/80 p-5 shadow-md">
        <Button
          size="lg"
          className={cn(
            "rounded-lg text-base shadow disabled:opacity-70",
            preflop === "open-raise" && "ring-4 ring-green-500 ring-offset-4",
          )}
          disabled={!!preflop}
          onClick={() => preflopAction("open-raise")}
        >
          Open
        </Button>
      </div>

      {!!preflop && (
        <Button
          size="lg"
          className="z-10 w-full rounded-lg text-base shadow"
          // z-10 は safari で ボタンが表示されなくなる問題の対応
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </div>
  );
};

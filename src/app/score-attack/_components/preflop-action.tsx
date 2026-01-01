import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionStore } from "../_utils/state";

export const PreflopAction = () => {
  const { preflop, preflopAction, switchNextPhase } = useActionStore();

  const handleSetAnswer = (answer: "open-raise" | "fold") => {
    console.log("handleSetAnswer");
    preflopAction(answer);
  };

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
          onClick={() => handleSetAnswer("open-raise")}
        >
          Open
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "rounded-lg text-base shadow disabled:opacity-70",
            preflop === "fold" && "ring-4 ring-green-500 ring-offset-4",
          )}
          disabled={!!preflop}
          onClick={() => handleSetAnswer("fold")}
        >
          Fold
        </Button>
      </div>

      {!!preflop && (
        <Button
          size="lg"
          className="w-1/2 rounded-lg text-base shadow"
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </div>
  );
};

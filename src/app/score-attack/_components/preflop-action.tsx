import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionStore } from "../_utils/state";

export const PreflopAction = () => {
  const { answer, state, preflopAction, switchNextPhase } = useActionStore();

  const handleSetAnswer = (answer: "open-raise" | "fold") => {
    preflopAction(answer);
  };

  const handleNext = () => {
    switchNextPhase();
  };

  return (
    <div className="flex w-fit gap-x-4 rounded-md border-2 border-green-400 bg-background/80 p-5 shadow-md">
      <Button
        size="lg"
        className={cn(
          "rounded-lg text-base shadow disabled:opacity-90",
          answer === "open-raise" && "ring-4 ring-green-500 ring-offset-4",
        )}
        disabled={state === "confirm"}
        onClick={() => handleSetAnswer("open-raise")}
      >
        Open
      </Button>
      <Button
        size="lg"
        variant="outline"
        className={cn(
          "rounded-lg text-base shadow disabled:opacity-90",
          answer === "fold" && "ring-4 ring-green-500 ring-offset-4",
        )}
        disabled={state === "confirm"}
        onClick={() => handleSetAnswer("fold")}
      >
        Fold
      </Button>

      {state === "confirm" && (
        <Button
          size="lg"
          className="rounded-lg text-base shadow"
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </div>
  );
};

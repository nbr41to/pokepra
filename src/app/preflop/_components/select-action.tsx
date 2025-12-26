import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionStore } from "../_utils/state";

export const SelectAction = () => {
  const { answer, state, setPosition, setHands, setAnswer, setState, ...rest } =
    useActionStore();

  const handleSetAnswer = (answer: "open-raise" | "fold") => {
    setAnswer(answer);
    setState("result");
  };

  const handleNext = () => {
    setAnswer("");
    setState("initial");
    setPosition();
    setHands();
  };

  console.log(rest);

  return (
    <div className="flex w-fit gap-x-4 rounded-md border-2 border-green-400 bg-background/80 p-5 shadow-md">
      <Button
        size="lg"
        className={cn(
          "rounded-lg text-base shadow disabled:opacity-90",
          answer === "open-raise" && "ring-4 ring-green-500 ring-offset-4",
        )}
        disabled={state === "result"}
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
        disabled={state === "result"}
        onClick={() => handleSetAnswer("fold")}
      >
        Fold
      </Button>

      {state === "result" && (
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

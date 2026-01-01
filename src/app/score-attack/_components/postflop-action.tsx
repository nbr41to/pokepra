import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionStore } from "../_utils/state";

export const PostflopAction = () => {
  const [loading, setLoading] = useState(false);
  const { phase, flop, turn, river, postflopAction, switchNextPhase } =
    useActionStore();

  const handleSetAnswer = async (answer: "commit" | "fold") => {
    setLoading(true);
    await postflopAction(phase, answer);
    setLoading(false);
  };

  const handleNext = () => {
    switchNextPhase();
  };

  const disabled =
    (phase === "flop" && !!flop) ||
    (phase === "turn" && !!turn) ||
    (phase === "river" && !!river);

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex w-fit gap-x-4 rounded-md border-2 border-green-400 bg-background/80 p-5 shadow-md">
        <Button
          size="lg"
          className={cn("rounded-lg text-base shadow")}
          disabled={disabled || loading}
          onClick={() => handleSetAnswer("commit")}
        >
          Commit
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn("rounded-lg text-base shadow")}
          disabled={disabled || loading}
          onClick={() => handleSetAnswer("fold")}
        >
          Fold
        </Button>
      </div>

      {!loading && disabled && (
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

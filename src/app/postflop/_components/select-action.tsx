import { Button } from "@/components/ui/button";
import { useActionStore } from "../_utils/state";

export const SelectAction = () => {
  const { phase, answer, setAnswer, setState } = useActionStore();

  const handleSetAnswer = (answer: "open-raise" | "fold") => {
    setAnswer(answer);
    setState("result");
  };

  return (
    <div className="flex w-fit gap-x-4 rounded-md border-2 border-green-400 bg-background/80 p-5 shadow-md">
      <Button
        size="lg"
        className="rounded-lg text-base shadow"
        onClick={() => handleSetAnswer("open-raise")}
      >
        Open
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="rounded-lg text-base shadow"
        onClick={() => handleSetAnswer("fold")}
      >
        Fold
      </Button>
    </div>
  );
};

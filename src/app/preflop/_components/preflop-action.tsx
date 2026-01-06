import { Button } from "@/components/ui/button";
import { useActionStore } from "../_utils/state";

export const PreflopAction = () => {
  const { preflop, preflopAction, shuffleAndDeal } = useActionStore();

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <Button
        size="lg"
        variant="outline"
        className="h-16 rounded-lg text-base shadow"
        disabled={!!preflop}
        onClick={() => preflopAction("open-raise")}
      >
        Open
      </Button>

      {!!preflop && (
        <Button
          size="lg"
          className="z-10 w-full rounded-lg text-base shadow"
          // z-10 は safari で ボタンが表示されなくなる問題の対応
          onClick={() => shuffleAndDeal()}
        >
          Next
        </Button>
      )}
    </div>
  );
};

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { simulateVsListEquity } from "@/lib/wasm/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const SelectAction = () => {
  const [loading, setLoading] = useState(false);
  const {
    phase,
    position,
    hero,
    board,
    flop,
    turn,
    river,
    postflopAction,
    shuffleAndDeal,
  } = useActionStore();

  const handleOnAction = async () => {
    setLoading(true);
    const result = await simulateVsListEquity({
      hero: hero,
      board: board,
      compare: getHandsByTiers(getTierIndexByPosition(position), [
        ...hero,
        ...board,
      ]),
      trials: 1000,
    });
    postflopAction(phase, "commit", result);
    setLoading(false);
  };

  const handleNext = () => {
    shuffleAndDeal();
  };

  const disabled =
    (phase === "flop" && !!flop) ||
    (phase === "turn" && !!turn) ||
    (phase === "river" && !!river);

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <Button
        size="lg"
        variant="outline"
        className="h-16 rounded-lg text-base shadow"
        disabled={disabled || loading}
        onClick={handleOnAction}
      >
        Commit
      </Button>

      {!loading && disabled && (
        <Button
          size="lg"
          className="w-full rounded-lg text-base shadow"
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </div>
  );
};

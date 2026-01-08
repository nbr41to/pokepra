"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActionStore } from "../_utils/state";

type Props = {
  onAction: (answer: "commit" | "fold") => Promise<void>;
};
export const PostflopAction = ({ onAction }: Props) => {
  const [loading, setLoading] = useState(false);
  const { phase, flop, turn, river, shuffleAndDeal } = useActionStore();

  const handleOnAction = async () => {
    setLoading(true);
    onAction("commit");
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

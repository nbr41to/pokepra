"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { iterateWinSimulations } from "@/lib/poker/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

type Props = {
  onAction: (answer: "commit" | "fold") => Promise<void>;
};
export const PostflopAction = ({ onAction }: Props) => {
  const [loading, setLoading] = useState(false);
  const { phase, flop, turn, river, switchNextPhase } = useActionStore();

  const handleOnAction = async () => {
    setLoading(true);
    onAction("commit");
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

async function getEquity({
  position,
  hand: fixHand,
  board,
}: {
  position: number;
  hand: string[];
  board: string[];
}): Promise<number> {
  const timeStart = performance.now(); // 計測開始

  const allHands = getHandsByTiers(getTierIndexByPosition(position), [
    ...board,
    ...fixHand,
  ]);

  const ITERATIONS = 100;
  const COUNT = allHands.length * ITERATIONS;

  const simulateResults = allHands.map((hand) => {
    const result = iterateWinSimulations([fixHand, hand], board, ITERATIONS);

    return {
      hand,
      result,
    };
  });

  // fixHand の勝率計算
  let win = 0;
  let tie = 0;

  simulateResults.forEach(({ result }) => {
    const fixHandResult = result.find(
      (r) => r.hand[0] === fixHand[0] && r.hand[1] === fixHand[1],
    );
    if (fixHandResult) {
      win += fixHandResult.wins;
      tie += fixHandResult.ties;
    }
  });

  const equity = (win + 0.5 * tie) / COUNT;
  console.log("equity:", equity);

  const durationMs = performance.now() - timeStart;
  console.log(`startWinSimulation: end in ${durationMs.toFixed(2)}ms`);

  return equity;
}

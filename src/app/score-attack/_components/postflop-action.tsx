"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { iterateWinSimulations } from "@/lib/poker/simulation";
import { cn } from "@/lib/utils";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";

export const PostflopAction = () => {
  const [loading, setLoading] = useState(false);
  const {
    phase,
    position,
    board,
    hand,
    flop,
    turn,
    river,
    postflopAction,
    switchNextPhase,
  } = useActionStore();

  const handleSetAnswer = async (answer: "commit" | "fold") => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200)); // アニメーション用のフレーム確保
    const equity = await getEquity({ position, hand, board });
    postflopAction(phase, answer, equity);
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

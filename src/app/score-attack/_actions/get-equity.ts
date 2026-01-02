"use server";

import { iterateWinSimulations } from "@/lib/poker/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";

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

  const simulateResults = await Promise.all(
    allHands.map(async (hand) => {
      const result = await iterateWinSimulations(
        [fixHand, hand],
        board,
        ITERATIONS,
      );

      return {
        hand,
        result,
      };
    }),
  );

  // fixHand の勝率計算
  let win = 0;
  let lose = 0;
  let tie = 0;

  simulateResults.forEach(({ result }) => {
    const fixHandResult = result.find(
      (r) => r.hand[0] === fixHand[0] && r.hand[1] === fixHand[1],
    );
    if (fixHandResult) {
      win += fixHandResult.wins;
      lose += fixHandResult.loses;
      tie += fixHandResult.ties;
    }
  });

  const equity = {
    winRate: win / COUNT,
    loseRate: lose / COUNT,
    tieRate: tie / COUNT,
  };

  const durationMs = performance.now() - timeStart;
  console.log(`startWinSimulation: end in ${durationMs.toFixed(2)}ms`);

  return equity.winRate;
}

export { getEquity };

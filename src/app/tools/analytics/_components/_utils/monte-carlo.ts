/**
 * Monte Carlo simulator
 */

import {
  evaluateHandsRanking,
  parseRangeToHands,
  simulateRangeVsRangeEquity,
  simulateVsListEquity,
  simulateVsListWithRanks,
} from "@/lib/wasm/simulation";

const ITERATIONS = 100;
/**
 * get hand ranking
 */
const getHandRankingInRange = async (hands: string[][], board: string[]) => {
  const result = await evaluateHandsRanking({
    hands,
    board,
  });

  return result;
};

/**
 * `hero` vs `villain`
 */
const simHandVsHandEquity = async (
  hero: string[],
  villain: string[],
  board: string[],
) => {
  const result = await simulateVsListEquity({
    hero,
    compare: [villain],
    board,
    trials: ITERATIONS,
  });

  return result;
};

/**
 * `hero` vs `villain` with ranks
 */
const simHandVsHandEquityWithRanks = async (
  hero: string[],
  villain: string[],
  board: string[],
) => {
  const result = await simulateVsListWithRanks({
    hero,
    compare: [villain],
    board,
    trials: ITERATIONS,
  });

  return result;
};

/**
 * `hero` vs `villain range`
 */
const simHandVsRangeEquity = async (
  hero: string[],
  villainRange: string,
  board: string[],
) => {
  const villains = await parseRangeToHands({
    range: villainRange,
    excludedCards: [...hero, ...board],
  });
  const result = await simulateVsListEquity({
    hero,
    compare: villains,
    board,
    trials: ITERATIONS,
  });

  return result;
};

/**
 * `hero` vs `villain range` with ranks
 */
const simHandVsRangeEquityWithRanks = async (
  hero: string[],
  villainRange: string,
  board: string[],
) => {
  const villains = await parseRangeToHands({
    range: villainRange,
    excludedCards: [...hero, ...board],
  });
  const result = await simulateVsListWithRanks({
    hero,
    compare: villains,
    board,
    trials: ITERATIONS,
  });

  return result;
};

/**
 * `hero range` vs `villain range`
 */
const simRangeVsRangeEquity = async (
  heroRange: string,
  villainRange: string,
  board: string[],
) => {
  const result = await simulateRangeVsRangeEquity({
    heroRange,
    villainRange,
    board,
    trials: ITERATIONS,
  });

  return result;
};

export {
  getHandRankingInRange,
  simHandVsHandEquity,
  simHandVsHandEquityWithRanks,
  simHandVsRangeEquity,
  simHandVsRangeEquityWithRanks,
  simRangeVsRangeEquity,
};

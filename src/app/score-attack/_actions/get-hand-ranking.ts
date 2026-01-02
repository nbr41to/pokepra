"use server";

import { cacheLife, cacheTag } from "next/cache";
import { iterateSimulations } from "@/lib/poker/simulation";
import { getHandsByTiers } from "@/utils/dealer";

type RankingResult = {
  hand: string[];
  score: number;
  iterate: number;
  result: {
    name: string;
    rank: number;
    count: number;
  }[];
};

async function getPokerRanking(situation: {
  hand: string[];
  board: string[];
}): Promise<RankingResult[]> {
  "use cache";
  cacheTag("getPokerRanking");
  cacheLife("max");

  const { hand, board } = situation;

  const timeStart = performance.now(); // 計測開始

  const allHands = getHandsByTiers(5, [...board, ...hand]);

  const ITERATE_COUNT = 1000;

  const results = [hand, ...allHands].map((hand) => {
    const result = iterateSimulations([...board, ...hand], ITERATE_COUNT);
    const score = result.reduce((acc, cur) => acc + cur.count * cur.rank, 0);

    return {
      hand,
      score: score / 10,
      iterate: ITERATE_COUNT,
      result,
    };
  });

  const durationMs = performance.now() - timeStart;
  console.log(`getPokerRanking: end in ${durationMs} ms`);

  return results;
}

export { getPokerRanking };

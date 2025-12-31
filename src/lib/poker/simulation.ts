import { getAllCards } from "@/utils/dealer";
import { solve } from "./pokersolver";

const getLeavingCards = (cards: string[]) => {
  const allCards = getAllCards();

  return allCards.filter((card) => !cards.includes(card));
};

const pickRandomCards = (leavingCards: string[], count: number) => {
  // 部分的なフィッシャーイェーツで必要枚数だけシャッフル
  const pool = leavingCards.slice();
  for (let i = 0; i < count; i += 1) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

async function simulate(
  boardAndHand: string[],
  leavingCards: string[],
  addCardCount: number,
) {
  const addCards = pickRandomCards(leavingCards, addCardCount);
  return solve([...boardAndHand, ...addCards]);
}

async function iterateSimulations(boardAndHand: string[], iterations: number) {
  if (iterations > 10000) {
    iterations = 10000;
  }
  const leavingCards = getLeavingCards(boardAndHand);
  const addCardCount = 7 - boardAndHand.length;
  const tallyMap = new Map<
    string,
    {
      name: string;
      rank: number;
      count: number;
    }
  >();
  for (let i = 0; i < iterations; i += 1) {
    const result = await simulate(boardAndHand, leavingCards, addCardCount);
    const current = tallyMap.get(result.name);
    if (current) {
      current.count += 1;
    } else {
      tallyMap.set(result.name, {
        name: result.name,
        rank: result.rank,
        count: 1,
      });
    }
  }

  return Array.from(tallyMap.values());
}

export { iterateSimulations };

import { getAllCards } from "@/utils/dealer";
import { solve, winner } from "./pokersolver";

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
function simulate(
  boardAndHand: string[],
  leavingCards: string[],
  addCardCount: number,
) {
  const addCards = pickRandomCards(leavingCards, addCardCount);
  return solve([...boardAndHand, ...addCards]);
}

/**
 * シュミレーション
 */
function iterateSimulations(boardAndHand: string[], iterations: number) {
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
    const result = simulate(boardAndHand, leavingCards, addCardCount);
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

/**
 * 勝敗のシュミレーション
 * @params hands 戦わせるハンド
 * @params board
 * @param iterations シュミレーション回数 (最大10000)
 */
function iterateWinSimulations(
  hands: string[][],
  board: string[],
  iterations = 1000,
) {
  // シュミレーション回数の上限
  if (iterations > 10000) {
    iterations = 10000;
  }

  // ボードに足りない枚数
  const addCardCount = 5 - board.length;

  // 結果の型
  const results: {
    hand: string[];
    wins: number;
    loses: number;
    ties: number;
  }[] = [];

  // シュミレーション開始
  for (let i = 0; i < iterations; i += 1) {
    const leavingCards = getLeavingCards([...board, ...hands.flat()]);
    const simulateResults = hands.map((hand) => {
      return simulate([...board, ...hand], leavingCards, addCardCount);
    });
    const winners = winner(simulateResults);

    hands.forEach((hand, index) => {
      const result = results.find((r) => r.hand === hand);
      if (!result) {
        results.push({ hand, wins: 0, loses: 0, ties: 0 });
      }
      const res = results.find((r) => r.hand === hand)!;
      if (winners.includes(simulateResults[index])) {
        if (winners.length > 1) {
          res.ties += 1;
        } else {
          res.wins += 1;
        }
      } else {
        res.loses += 1;
      }
    });
  }

  return results;
}

export { iterateSimulations, iterateWinSimulations };

// @ts-expect-error
import { calculateEquity } from "poker-odds";
import { CardGroup, OddsCalculator } from "poker-odds-calculator";
// @ts-expect-error
import PokerResolver from "pokersolver";

type Props = {
  hand: string[];
  board: string[];
};

export const PokerModules = ({ hand, board }: Props) => {
  const solve = PokerResolver.Hand.solve([...hand, ...board]); // 約の判定
  const results = calculateEquity([hand], board, 100); // 100 simulations

  const player1Cards = CardGroup.fromString(hand.join(""));
  // const player2Cards = CardGroup.fromString("JdQd");
  const boardGroup = CardGroup.fromString(board.join(""));
  const calculated = OddsCalculator.calculate([player1Cards], boardGroup);

  return (
    <div className="text-xs">
      <div>solve</div>
      <pre>{JSON.stringify(solve, null, 2)}</pre>
      <div>results</div>
      <pre>{JSON.stringify(results, null, 2)}</pre>
      <div>calculated</div>
      <pre>{JSON.stringify(calculated, null, 2)}</pre>
    </div>
  );
};

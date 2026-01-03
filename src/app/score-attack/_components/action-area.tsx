import { HandConfirmation } from "@/components/hand-confirmation";
import { iterateWinSimulations } from "@/lib/poker/simulation";
import { getHandsByTiers } from "@/utils/dealer";
import { getTierIndexByPosition } from "@/utils/preflop-range";
import { useActionStore } from "../_utils/state";
import { SelectAction } from "./select-action";

export const ActionArea = () => {
  const {
    phase,
    position,
    hand,
    board,
    showedHand,
    showHand,
    preflopAction,
    postflopAction,
  } = useActionStore();

  const handleOnPostflopAction = async (answer: "commit" | "fold") => {
    await new Promise((resolve) => setTimeout(resolve, 200)); // アニメーション用のフレーム確保
    const equity = await getEquity({ position, hand, board });
    postflopAction(phase, answer, equity);
  };

  const handleFoldAction = () => {
    if (phase === "preflop") {
      preflopAction("fold");
    } else {
      handleOnPostflopAction("fold");
    }
  };

  return (
    <div className="relative pt-6">
      <HandConfirmation
        hands={hand}
        onOpenHand={showHand}
        onFold={handleFoldAction}
      />
      {showedHand && (
        <div className="absolute top-0 left-0 h-full w-1/2 pt-6">
          <SelectAction onAction={handleOnPostflopAction} />
        </div>
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

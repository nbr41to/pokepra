import { Board } from "@/components/board";
import { useHoldemStore } from "./_utils/state";

export const CommunityArea = () => {
  const { street, board } = useHoldemStore();

  if (board.length === 0 || street === "preflop") return null;

  return (
    <div className="mx-auto mb-4 h-20 w-fit">
      <Board cards={board} />
    </div>
  );
};

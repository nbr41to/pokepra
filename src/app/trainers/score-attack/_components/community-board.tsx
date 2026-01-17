import { Board } from "@/components/board";
import { useActionStore } from "./_utils/state";

export const CommunityBoard = () => {
  const { street, board } = useActionStore();

  if (board.length === 0 || street === "preflop") return null;

  return (
    <div className="mx-auto h-20 w-fit">
      <Board cards={board} />
    </div>
  );
};

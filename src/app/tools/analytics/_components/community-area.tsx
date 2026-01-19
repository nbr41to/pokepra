import { Board } from "@/components/board";
import { useHoldemStore } from "./_utils/state";

export const CommunityArea = () => {
  const { board, disableBoardAnimation } = useHoldemStore();

  return (
    <div className="mx-auto h-20 w-81 scale-90">
      <Board cards={board} disableAnimation={disableBoardAnimation} />
    </div>
  );
};

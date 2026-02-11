import { Board } from "@/components/board";
import { useFullStreetDefenseStore } from "./_utils/state";

export const CommunityBoard = () => {
  const { board, confirmedHand } = useFullStreetDefenseStore();

  if (!confirmedHand) return <div className="h-20" />;

  return (
    <div className="mx-auto h-20 w-fit">
      <Board cards={board} />
    </div>
  );
};

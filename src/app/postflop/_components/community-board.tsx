"use client";

import { Board } from "@/components/board";
import { useActionStore } from "../_utils/state";

export const CommunityBoard = () => {
  const { showedHand, board } = useActionStore();

  if (board.length === 0 || !showedHand) return null;

  return <Board cards={board} />;
};

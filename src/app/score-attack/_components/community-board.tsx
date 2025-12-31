"use client";

import { Board } from "@/components/board";
import { useActionStore } from "../_utils/state";

export const CommunityBoard = () => {
  const { phase, board } = useActionStore();

  if (board.length === 0 || phase === "preflop") return null;

  return <Board cards={board} />;
};

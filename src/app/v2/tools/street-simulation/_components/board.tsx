"use client";

import { useEffect, useState } from "react";
import { AnimationBoard } from "@/components/v2/animation-board";
import { useHoldem } from "../utils/holdem";

export const Board = () => {
  const round = useHoldem((state) => state.round);
  const openedBoard = useHoldem((state) => state.openedBoard);
  const [currentBoard, setCurrentBoard] = useState(openedBoard);
  const [currentRound, setCurrentRound] = useState(round);
  const [disableAnimation, setDisableAnimation] = useState(false);

  useEffect(() => {
    if (
      currentBoard.slice(0, 3).toString() !== openedBoard.slice(0, 3).toString()
    ) {
      console.log("reset!!!");
      setDisableAnimation(false);
      setCurrentBoard(openedBoard);
      setCurrentRound(round);

      return;
    }
    if (round > currentRound) {
      setDisableAnimation(false);
      setCurrentRound(round);
    } else if (round < currentRound) {
      setDisableAnimation(true);
      setCurrentRound(round);
    }
  }, [currentRound, round, openedBoard, currentBoard]);

  return (
    <div className="mx-auto w-fit">
      <AnimationBoard cids={openedBoard} disableAnimation={disableAnimation} />
    </div>
  );
};

"use client";

import { Board } from "./board";
import { HeroHand } from "./hero-hand";

export const Main = () => {
  return (
    <div className="mx-auto flex w-full max-w-5xl grow flex-col justify-between px-4 py-4">
      <div className="grow"></div>
      <div>
        <Board />
        <HeroHand />
      </div>
    </div>
  );
};

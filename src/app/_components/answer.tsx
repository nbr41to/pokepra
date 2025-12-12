"use client";

import { Button } from "@/components/ui/button";
import { genHands } from "@/utils/genHands";
import { genPosition } from "@/utils/genPosition";
import { useState } from "react";
import { Situation } from "./situation";
import { getHandString, getResult } from "@/utils/getResult";
import { RangeTable } from "./range-table";

export const Answer = () => {
  const [hands, setHands] = useState<string[]>([]);
  const [position, setPosition] = useState<string>("");
  const [answer, setAnswer] = useState<"open-raise" | "fold">();

  const nextSituation = () => {
    const newHands = genHands();
    const newPosition = genPosition();
    setHands(newHands);
    setPosition(newPosition);
    setAnswer(undefined);
  };

  const result =
    hands.length !== 2 ? undefined : answer === getResult(hands, position);

  return (
    <div className="flex flex-col justify-between items-center gap-y-6 w-full h-screen py-5 px-3">
      <div>
        {hands.length !== 0 && answer && (
          <RangeTable mark={getHandString(hands)} />
        )}
      </div>

      <div className="flex flex-col items-center gap-y-6 w-full">
        <Situation hands={hands} position={position} />
        <div className="h-8">
          {answer && result && (
            <p className="text-green-500 text-2xl font-bold">Correct!</p>
          )}
          {answer && !result && (
            <p className="text-red-500 text-2xl font-bold">Incorrect!</p>
          )}
        </div>

        {hands.length === 0 || answer ? (
          <Button variant="outline" size="lg" onClick={nextSituation}>
            Next
          </Button>
        ) : (
          <div className="flex justify-between gap-x-2 w-full">
            <Button
              className="flex-1"
              variant="outline"
              size="lg"
              onClick={() => setAnswer("open-raise")}
            >
              Open Raise
            </Button>{" "}
            <Button
              className="flex-1"
              variant="outline"
              size="lg"
              onClick={() => setAnswer("fold")}
            >
              Fold
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

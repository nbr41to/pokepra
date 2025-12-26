"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { genPosition } from "@/utils/genPosition";
import { getHandString, getResult } from "@/utils/getResult";
import { RangeTable } from "./range-table";
import { Situation } from "./situation";
import { genHands } from "@/utils/dealer";

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
    <div className="flex h-screen w-full flex-col items-center justify-between gap-y-6 px-3 py-5">
      <div>
        {hands.length !== 0 && answer && (
          <RangeTable mark={getHandString(hands)} />
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-y-6">
        <Situation hands={hands} position={position} />
        <div className="h-8">
          {answer && result && (
            <p className="font-bold text-2xl text-green-500">Correct!</p>
          )}
          {answer && !result && (
            <p className="font-bold text-2xl text-red-500">Incorrect!</p>
          )}
        </div>

        {hands.length === 0 || answer ? (
          <Button variant="outline" size="lg" onClick={nextSituation}>
            Next
          </Button>
        ) : (
          <div className="flex w-full justify-between gap-x-2">
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

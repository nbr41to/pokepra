"use client";

import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionStore } from "./_utils/state";
import { ActionArea } from "./action-area";
import { CommunityBoard } from "./community-board";
import { ConfirmPosition } from "./confirm-position";

export function Main() {
  const {
    initialized,
    shuffleAndDeal,
    confirmedHand,
    heroEquity,
    pot,
    bet,
    delta,
    clear,
  } = useActionStore();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    shuffleAndDeal();

    return clear;
  }, [shuffleAndDeal, clear]);

  if (!initialized) return null;

  return (
    <div className="w-full space-y-1">
      <div className="text-right">
        <Button
          onClick={() => setHidden(!hidden)}
          size="icon-lg"
          variant="outline"
          className="rounded-full"
        >
          <Eye className={cn(hidden && "hidden")} />
          <EyeClosed className={cn(!hidden && "hidden")} />
        </Button>
      </div>
      <div className="h-18">
        {confirmedHand && (
          <div className="mx-auto grid w-fit grid-cols-2 gap-x-2">
            <div>Pot: {pot.toFixed(2)}</div>
            <div
              className={cn(
                "flex justify-between gap-x-2",
                hidden && "invisible",
              )}
            >
              <span>必要勝率:</span>
              <span>{((bet / (pot + bet)) * 100).toFixed(2)}%</span>
            </div>
            <div>Bet: {bet.toFixed(2)}</div>
            <div
              className={cn(
                "flex justify-between gap-x-2",
                hidden && "invisible",
              )}
            >
              <span>勝率:</span>
              <span>{(heroEquity * 100).toFixed(2)}%</span>
            </div>
            <div />
            <div className="flex justify-between gap-x-2">
              <span>差分:</span>
              <span
                className={cn(
                  "font-bold",
                  delta > 0 && "text-green-500",
                  delta < 0 && "text-red-500",
                )}
              >
                {(delta * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
      <CommunityBoard />
      <ConfirmPosition />
      <ActionArea />
    </div>
  );
}

"use client";

import { ChevronLeftIcon, ChevronRightIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { PlayCard } from "@/components/v2/play-card";
import { useHoldem } from "../utils/holdem";

export const HeroHand = () => {
  const hands = useHoldem((state) => state.hands);
  const heroIndex = useHoldem((state) => state.heroIndex);
  const round = useHoldem((state) => state.round);
  const dealFlop = useHoldem((state) => state.dealFlop);
  const dealTurn = useHoldem((state) => state.dealTurn);
  const dealRiver = useHoldem((state) => state.dealRiver);
  const shuffleAndDeal = useHoldem((state) => state.shuffleAndDeal);

  const handlePrevious = () => {
    if (round === 3) {
      dealFlop();
    }
    if (round === 4) {
      dealTurn();
    }
  };

  const handleNext = () => {
    if (round === 2) {
      dealTurn();
    }
    if (round === 3) {
      dealRiver();
    }
  };

  return (
    <div className="px-10 py-3">
      <div className="mb-3 flex items-center gap-2">
        {hands[heroIndex].map((cid) => (
          <PlayCard key={cid} cid={cid} size="sm" />
        ))}
        <div className="flex grow justify-between">
          <div className="flex grow justify-center gap-x-3">
            <Button
              size="icon"
              variant="outline"
              disabled={round < 3}
              onClick={handlePrevious}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={round === 4}
              onClick={handleNext}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <Button size="icon" variant="outline" onClick={shuffleAndDeal}>
            <RefreshCw />
          </Button>
        </div>
      </div>
    </div>
  );
};

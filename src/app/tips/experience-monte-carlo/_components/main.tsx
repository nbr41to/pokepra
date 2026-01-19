"use client";

import { DiceExperiment } from "./dice-experiment";
import { PokerHandProbabilitySection } from "./poker-hand-probability-section";

export const Main = () => {
  return (
    <div className="space-y-6">
      <DiceExperiment />
      <PokerHandProbabilitySection />
    </div>
  );
};

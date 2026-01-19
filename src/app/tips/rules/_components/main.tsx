import { ChipsGameSection } from "./chips-game-section";
import { FlowSection } from "./flow-section";
import { PokerIntroSection } from "./poker-intro-section";
import { PositionSection } from "./position-section";
import { TexasHoldemSection } from "./texas-holdem-section";

export const Main = () => {
  return (
    <>
      <PokerIntroSection />
      <TexasHoldemSection />
      <ChipsGameSection />
      <FlowSection />
      <PositionSection />
    </>
  );
};

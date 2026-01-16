import { HeaderTitle } from "@/components/header-title";
import { ChipsGameSection } from "./_components/chips-game-section";
import { FlowSection } from "./_components/flow-section";
import { PokerIntroSection } from "./_components/poker-intro-section";
import { PositionSection } from "./_components/position-section";
import { TexasHoldemSection } from "./_components/texas-holdem-section";

export default function RulesPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-10">
      <HeaderTitle
        title="ポーカーのルールとポイント"
        description="初心者向けに、テキサスホールデムの基本を図と記号で整理します。"
      />

      <PokerIntroSection />
      <TexasHoldemSection />
      <ChipsGameSection />
      <FlowSection />
      <PositionSection />
    </div>
  );
}

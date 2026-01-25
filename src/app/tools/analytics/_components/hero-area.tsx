import { ArrowBigLeft, ArrowBigRight, RefreshCcw } from "lucide-react";
import { Combo } from "@/components/combo";
import { Button } from "@/components/shadcn/button";
import { useHoldemStore } from "./_utils/state";
import { EditSituationSheet } from "./edit-situation-sheet";

export const HeroArea = () => {
  const { street, hero, board, onAdvance, onRetreat, shuffleAndDeal } =
    useHoldemStore();

  return (
    <div className="flex justify-center gap-x-4 pt-2">
      <div className="flex gap-x-6">
        <Combo hand={hero} className="scale-110" />
        <Button
          className=""
          size="icon-lg"
          variant="outline"
          disabled={street === "flop"}
          onClick={onRetreat}
        >
          <ArrowBigLeft />
        </Button>
        <Button
          className=""
          size="icon-lg"
          variant="outline"
          disabled={street === "river"}
          onClick={onAdvance}
        >
          <ArrowBigRight />
        </Button>
      </div>

      <div className="fixed right-4 bottom-6 flex gap-x-2">
        <Button
          className="rounded-full"
          size="icon-lg"
          variant="outline"
          onClick={shuffleAndDeal}
        >
          <RefreshCcw />
        </Button>
        <EditSituationSheet
          key={hero.join("-") + board.join("-")}
          initialHero={hero}
          initialBoard={board}
        />
      </div>
    </div>
  );
};

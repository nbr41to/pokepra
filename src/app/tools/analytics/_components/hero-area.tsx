import { ArrowBigLeft, ArrowBigRight, RefreshCcw } from "lucide-react";
import { Combo } from "@/components/combo";
import { Button } from "@/components/ui/button";
import { useHoldemStore } from "./_utils/state";
import { EditSituationSheet } from "./edit-situation-sheet";

export const HeroArea = () => {
  const { street, hero, board, onAdvance, onRetreat, shuffleAndDeal } =
    useHoldemStore();

  return (
    <div className="flex justify-between gap-x-4 pt-2">
      <Button
        className="rounded-full"
        size="icon-lg"
        variant="outline"
        onClick={shuffleAndDeal}
      >
        <RefreshCcw />
      </Button>
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
      <EditSituationSheet
        key={hero.join("-") + board.join("-")}
        initialHero={hero}
        initialBoard={board}
      />
    </div>
  );
};

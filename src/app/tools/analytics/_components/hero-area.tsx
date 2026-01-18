import { ArrowBigLeft, ArrowBigRight, RefreshCcw } from "lucide-react";
import { Combo } from "@/components/combo";
import { Button } from "@/components/ui/button";
import { useHoldemStore } from "./_utils/state";

export const HeroArea = () => {
  const { street, hero, onAdvance, onRetreat, shuffleAndDeal } =
    useHoldemStore();

  return (
    <div className="flex justify-center gap-x-4">
      <Button
        className=""
        size="icon-lg"
        variant="outline"
        onClick={() => shuffleAndDeal()}
      >
        <RefreshCcw />
      </Button>
      <Combo hand={hero} className="" />
      <Button
        className=""
        size="icon-lg"
        variant="outline"
        disabled={street === "preflop"}
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
  );
};

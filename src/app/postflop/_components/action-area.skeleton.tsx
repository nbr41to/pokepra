import { ConfirmEquityDrawerSkeleton } from "@/components/confirm-equity";
import { ConfirmRankingSheetSkeleton } from "@/components/confirm-hand-ranking";
import { Button } from "@/components/ui/button";

export const ActionAreaSkeleton = () => {
  return (
    <>
      <div className="flex h-12 gap-4 px-2">
        <ConfirmRankingSheetSkeleton />
        <ConfirmEquityDrawerSkeleton />
      </div>
      <div className="p-5">
        <Button
          size="lg"
          variant="outline"
          className="h-16 rounded-lg text-base shadow"
          disabled
        >
          Commit
        </Button>
      </div>
    </>
  );
};

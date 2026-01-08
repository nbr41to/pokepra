import { Crown } from "lucide-react";
import { Button } from "../ui/button";

export function ConfirmRankingSheetSkeleton() {
  return (
    <Button
      className="animate-pulse rounded-full"
      variant="outline"
      size="icon-lg"
      disabled
    >
      <Crown size={16} />
    </Button>
  );
}

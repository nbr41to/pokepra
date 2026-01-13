import { ArrowBigUpDash } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOLD_GUIDE_DELAY_MS } from "../constants";

type FoldGuideProps = {
  locked: boolean;
  folded: boolean;
  disabled: boolean;
  showFold: boolean;
};

export const FoldGuide = ({
  locked,
  folded,
  disabled,
  showFold,
}: FoldGuideProps) => {
  const hidden = folded || disabled || !showFold;
  const guideClasses = cn(
    "pointer-events-none absolute right-24 bottom-3 z-10 flex h-16 rotate-6 flex-col justify-center gap-y-1",
    locked ? "opacity-100 transition-opacity" : "opacity-0 transition-none",
    hidden && "hidden",
  );

  return (
    <div
      className={guideClasses}
      style={
        locked ? { transitionDelay: `${FOLD_GUIDE_DELAY_MS}ms` } : undefined
      }
    >
      <ArrowBigUpDash
        size={32}
        className="animate-bounce text-gray-400 dark:text-gray-600"
      />
      <span className="text-gray-400 text-sm dark:text-gray-600">Fold</span>
    </div>
  );
};

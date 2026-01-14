import { OtherHand } from "@/components/other-hand";
import { cn } from "@/lib/utils";
import { useHoldemStore } from "./_utils/state";

type Props = {
  className?: string;
};

export const VillainHand = ({ className }: Props) => {
  const { villains, villainsEq, finished } = useHoldemStore();
  const eq = villainsEq?.[0];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-end gap-y-1",
        className,
      )}
    >
      {typeof eq === "number" && finished && (
        <span>{(eq * 100).toFixed(1)}%</span>
      )}
      <OtherHand hand={villains[0]} reversed={finished} />
    </div>
  );
};

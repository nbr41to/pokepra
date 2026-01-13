import { OtherHand } from "@/components/other-hand";
import { cn } from "@/lib/utils";
import { useHoldemStore } from "./_utils/state";

type Props = {
  className?: string;
};

export const VillainHand = ({ className }: Props) => {
  const { villains, villainsEq, finished } = useHoldemStore();
  console.log(villainsEq);
  const eq = villainsEq?.[0];

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-x-3",
        className,
      )}
    >
      {finished && typeof eq === "number" && (
        <span>{(eq * 100).toFixed(2)}%</span>
      )}
      <OtherHand hand={villains[0]} reversed={finished} />
    </div>
  );
};

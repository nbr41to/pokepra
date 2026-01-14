import { OtherHand } from "@/components/other-hand";
import { cn } from "@/lib/utils";
import { useOpenRaiseVsBbStore } from "./_utils/state";

type Props = {
  className?: string;
};

export const VillainHand = ({ className }: Props) => {
  const { villains, villainsEq, finished } = useOpenRaiseVsBbStore();
  const eq = villainsEq?.[0];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-y-1",
        className,
      )}
    >
      <span className="text-muted-foreground text-xs">BB</span>
      {typeof eq === "number" && <span>{(eq * 100).toFixed(2)}%</span>}
      <OtherHand hand={villains[0]} reversed={finished} />
    </div>
  );
};

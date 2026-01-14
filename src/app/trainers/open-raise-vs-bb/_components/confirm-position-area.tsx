import { Position } from "@/components/position";
import { getPositionLabel } from "@/utils/position";
import { useOpenRaiseVsBbStore } from "./_utils/state";

export const ConfirmPositionArea = () => {
  const { position } = useOpenRaiseVsBbStore();
  const positionLabel = getPositionLabel(position, 9);

  return (
    <div className="space-y-1">
      <Position total={9} playerPosition={position} />
      <p className="text-center text-muted-foreground text-xs">
        Open-raise from {positionLabel} -&gt; BB call (Heads-up)
      </p>
    </div>
  );
};

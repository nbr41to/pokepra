import { Position } from "@/components/position";
import { useActionStore } from "./_utils/state";

export const ConfirmPosition = () => {
  const { villainPosition, opponentsCount } = useActionStore();

  return (
    <div>
      <p className="text-center text-sm">相手のポジション</p>
      <Position total={9} playerPosition={villainPosition} heroLabel="" />
      <p className="mt-1 text-center text-muted-foreground text-xs">
        相手人数(自分以外): {opponentsCount}人
      </p>
    </div>
  );
};

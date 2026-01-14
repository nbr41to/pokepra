import { Position } from "@/components/position";
import { useActionStore } from "./_utils/state";

export const ConfirmPosition = () => {
  const { villainPosition } = useActionStore();

  return (
    <div>
      <p className="text-center text-sm">相手のポジション</p>
      <Position total={9} playerPosition={villainPosition} heroLabel="" />
    </div>
  );
};

import { Position } from "@/components/position";
import { useActionStore } from "./_utils/state";

export const ConfirmPosition = () => {
  const { villainPosition } = useActionStore();

  return <Position total={9} playerPosition={villainPosition} heroLabel="" />;
};

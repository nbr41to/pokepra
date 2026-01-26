import { Position } from "@/components/position";
import { useActionStore } from "./_utils/state";

export const ConfirmPosition = () => {
  const { position } = useActionStore();

  return <Position total={9} playerPosition={position} heroLabel="" />;
};

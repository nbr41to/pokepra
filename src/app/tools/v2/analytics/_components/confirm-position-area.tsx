import { Position } from "@/components/position";
import { useHoldemStore } from "./_utils/state";

export const ConfirmPositionArea = () => {
  const { position } = useHoldemStore();

  return <Position total={9} playerPosition={position} />;
};

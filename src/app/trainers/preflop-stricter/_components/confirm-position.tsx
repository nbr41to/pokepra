import { Position } from "@/components/position";
import { useTrainerStore } from "./_utils/state";

export const ConfirmPosition = () => {
  const { position } = useTrainerStore();

  return <Position total={9} playerPosition={position} />;
};

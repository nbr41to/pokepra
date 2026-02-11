import { Position } from "@/components/position";
import { useFullStreetDefenseStore } from "./_utils/state";

export const ConfirmPosition = () => {
  const { villainPosition } = useFullStreetDefenseStore();

  return <Position total={9} playerPosition={villainPosition} heroLabel="BB" />;
};

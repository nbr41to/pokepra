import { useActionStore } from "./_utils/state";
import { VillainHands } from "./villain-hands";

export const OtherPlayers = () => {
  const PEOPLE = 9;
  const { position, villains, preflop, result } = useActionStore();

  return (
    <VillainHands
      className="h-[calc(100dvh-272px-56px-32px*2)]"
      people={PEOPLE}
      position={position}
      villains={villains}
      reversed={!!preflop}
      result={result}
    />
  );
};

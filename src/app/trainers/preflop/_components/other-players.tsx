import { useActionStore } from "./_utils/state";
import { VillainHands } from "./villain-hands";

export const OtherPlayers = () => {
  const PEOPLE = 9;
  const { position, stack, otherPlayersHands, preflop, result } =
    useActionStore();

  return (
    <div className="relative">
      <VillainHands
        className="h-[calc(100dvh-272px-56px-32px*2)]"
        people={PEOPLE}
        position={position}
        villains={otherPlayersHands}
        reversed={!!preflop}
        result={result}
      />
      <div className="absolute right-0 bottom-0 font-bold text-xl">
        {stack} pt
      </div>
    </div>
  );
};

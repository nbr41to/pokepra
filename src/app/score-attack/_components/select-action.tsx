import { useActionStore } from "../_utils/state";
import { PostflopAction } from "./postflop-action";
import { PreflopAction } from "./preflop-action";

export const SelectAction = () => {
  const { phase } = useActionStore();

  return (
    <>
      {phase === "preflop" && <PreflopAction />}
      {phase === "flop" && <PostflopAction />}
      {phase === "turn" && <PostflopAction />}
      {phase === "river" && <PostflopAction />}
    </>
  );
};

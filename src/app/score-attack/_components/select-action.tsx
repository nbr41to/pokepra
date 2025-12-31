import { useActionStore } from "../_utils/state";
import { PreflopAction } from "./preflop-action";

export const SelectAction = () => {
  const { phase, state } = useActionStore();

  if (state === "initial") return null;

  return <>{phase === "preflop" && <PreflopAction />}</>;
};

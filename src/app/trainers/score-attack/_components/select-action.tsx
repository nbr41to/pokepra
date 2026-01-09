import { useActionStore } from "./_utils/state";
import { PostflopAction } from "./postflop-action";
import { PreflopAction } from "./preflop-action";

type Props = {
  onAction: (answer: "commit" | "fold") => Promise<void>;
};
export const SelectAction = ({ onAction }: Props) => {
  const { phase } = useActionStore();

  return (
    <>
      {phase === "preflop" ? (
        <PreflopAction />
      ) : (
        <PostflopAction onAction={onAction} />
      )}
    </>
  );
};

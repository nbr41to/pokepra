import { PostflopAction } from "./postflop-action";

type Props = {
  onAction: (answer: "commit" | "fold") => Promise<void>;
};
export const SelectAction = ({ onAction }: Props) => {
  return <PostflopAction onAction={onAction} />;
};

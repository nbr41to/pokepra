import { PiggyBank } from "lucide-react";
import { useActionStore } from "./_utils/state";

export const CurrentPot = () => {
  const { pot, stack } = useActionStore();

  return (
    <div className="flex items-end justify-between px-4">
      <div className="flex w-fit items-center gap-x-2 rounded-full border border-yellow-500 bg-yellow-200 px-3 py-1">
        <PiggyBank />
        <span className="font-bold text-xl">{pot}</span>
      </div>
      <div>{stack}pt</div>
    </div>
  );
};

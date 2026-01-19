import { CheckCircle } from "lucide-react";

type Props = {
  delta?: number;
};

export const ResultGood = ({ delta }: Props) => {
  return (
    <div className="flex items-center gap-2 text-green-500">
      <CheckCircle size={32} strokeWidth={2.5} />
      <span className="font-bold text-2xl">
        GOOD {delta !== undefined ? `+${delta}` : ""}
      </span>
    </div>
  );
};

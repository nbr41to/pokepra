import { CircleX } from "lucide-react";

type Props = {
  delta: number;
};

export const ResultBad = ({ delta }: Props) => {
  return (
    <div className="flex items-center gap-2 text-red-500">
      <CircleX size={32} strokeWidth={2.5} />
      <span className="font-bold text-2xl">BAD {delta}</span>
    </div>
  );
};

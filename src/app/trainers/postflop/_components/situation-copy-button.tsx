import { Calculator, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  board: string[];
};

export const SituationCopyButton = ({ board }: Props) => {
  const encodedBoard = board.map(encodeURIComponent);
  return (
    <Button
      className="relative rounded-full"
      variant="outline"
      size="icon-lg"
      asChild={board.length > 0}
      disabled={board.length === 0}
    >
      <a
        href={`/simulation-b?board=${encodedBoard}`}
        target="_blank"
        rel="noreferrer"
      >
        <Calculator />
        <ExternalLink
          className="absolute -top-1.5 -right-1.5 scale-50"
          strokeWidth={3}
        />
      </a>
    </Button>
  );
};

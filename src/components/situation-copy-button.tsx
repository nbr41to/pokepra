import { Calculator, ExternalLink } from "lucide-react";
import { Button } from "@/components/shadcn/button";

type Props = {
  hero: string[];
  board: string[];
};

export const SituationCopyButton = ({ hero, board }: Props) => {
  const encodedHero = hero.map(encodeURIComponent);
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
        href={`/tools/calc-vs-range-equity?hero=${encodedHero}&board=${encodedBoard}`}
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

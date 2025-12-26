import { Button } from "@/components/ui/button";

type Props = {
  phase: "result" | "options";
};

export const SelectAction = ({ phase }: Props) => {
  return (
    <div className="flex gap-x-4">
      <Button size="lg">Open</Button>
      <Button size="lg" variant="outline">
        Fold
      </Button>
    </div>
  );
};

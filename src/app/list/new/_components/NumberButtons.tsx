import { Button } from "@/components/ui/button";

type Props = {
  onClick: (value: number) => void;
};

export const NumberButtons = ({ onClick }: Props) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 gap-2">
        <Button className="text-xl" onClick={() => onClick(1)}>
          A
        </Button>
        <Button className="text-xl" onClick={() => onClick(2)}>
          2
        </Button>
        <Button className="text-xl" onClick={() => onClick(3)}>
          3
        </Button>
        <Button className="text-xl" onClick={() => onClick(4)}>
          4
        </Button>
        <Button className="text-xl" onClick={() => onClick(5)}>
          5
        </Button>
        <Button className="text-xl" onClick={() => onClick(6)}>
          6
        </Button>
        <Button className="text-xl" onClick={() => onClick(7)}>
          7
        </Button>
        <Button className="text-xl" onClick={() => onClick(8)}>
          8
        </Button>
        <Button className="text-xl" onClick={() => onClick(9)}>
          9
        </Button>
        <Button className="text-xl" onClick={() => onClick(10)}>
          10
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button className="flex-grow text-xl" onClick={() => onClick(11)}>
          J
        </Button>
        <Button className="flex-grow text-xl" onClick={() => onClick(12)}>
          Q
        </Button>
        <Button className="flex-grow text-xl" onClick={() => onClick(13)}>
          K
        </Button>
      </div>
    </div>
  );
};

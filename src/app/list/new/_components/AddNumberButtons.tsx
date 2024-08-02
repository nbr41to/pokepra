import { Button } from "@/components/ui/button";

type Props = {
  currentCount: number;
  onClick: (value: number) => void;
};

const ADD_NUMBERS = [1, 2, 3, 5, 10];
export const AddNumberButtons = ({ currentCount, onClick }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {ADD_NUMBERS.map((value) => (
        <Button
          key={value}
          className="flex-grow text-xl"
          onClick={() => onClick(value + currentCount)}
        >
          +{value}
        </Button>
      ))}
    </div>
  );
};

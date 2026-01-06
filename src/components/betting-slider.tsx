import { Slider } from "./ui/slider";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export const BettingSlider = ({ value, onChange }: Props) => {
  return (
    <div className="w-100">
      <Slider
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={1}
        max={100}
        step={1}
      />
      <div className="mt-2 text-center">{value}%</div>
    </div>
  );
};

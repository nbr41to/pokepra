import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { fn } from "storybook/test";
import { SelectPosition } from "./select-position";

const meta = {
  component: SelectPosition,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    total: 6,
    value: 4,
    setValue: fn(),
  },
} satisfies Meta<typeof SelectPosition>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithState: Story["render"] = (args) => {
  const [value, setValue] = useState(args.value);

  useEffect(() => {
    setValue(args.value);
  }, [args.value]);

  return (
    <div className="w-[320px]">
      <SelectPosition {...args} value={value} setValue={setValue} />
    </div>
  );
};

export const Default: Story = {
  render: renderWithState,
};

export const NinePlayers: Story = {
  args: {
    total: 9,
    value: 7,
  },
  render: renderWithState,
};

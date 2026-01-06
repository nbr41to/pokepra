import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { BettingSlider } from "./betting-slider";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: BettingSlider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    value: 10,
    onChange: fn(),
  },
} satisfies Meta<typeof BettingSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: (props) => {
    const [value, setValue] = useState(props.value ?? 10);
    const handleChange = (next: number) => {
      setValue(next);
      props.onChange?.(next);
    };

    return <BettingSlider {...props} value={value} onChange={handleChange} />;
  },
};

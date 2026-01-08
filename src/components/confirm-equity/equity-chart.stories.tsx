import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EquityChart } from "./equity-chart";
import example from "./example.json";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: EquityChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    result: example,
    step: 10,
  },
} satisfies Meta<typeof EquityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {};

export const Threshold20: Story = {
  args: {
    step: 20,
  },
};

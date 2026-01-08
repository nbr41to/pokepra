import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
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
    promise: Promise.resolve(example),
  },
} satisfies Meta<typeof EquityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: () => (
    <Suspense
      fallback={
        <div className="grid h-12 w-80 place-items-center">loading</div>
      }
    >
      <EquityChart promise={Promise.resolve(example)} />
    </Suspense>
  ),
};

export const Threshold20: Story = {
  render: () => (
    <Suspense
      fallback={
        <div className="grid h-12 w-80 place-items-center">loading</div>
      }
    >
      <EquityChart promise={Promise.resolve(example)} step={20} />
    </Suspense>
  ),
};

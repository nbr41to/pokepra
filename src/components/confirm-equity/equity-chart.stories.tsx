import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import { EquityChart } from "./equity-chart";
import { EquityChartSkeleton } from "./equity-chart.skeleton";
import example from "./example.json";

const meta = {
  component: EquityChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    rankPromise: Promise.resolve(example),
  },
} satisfies Meta<typeof EquityChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Suspense fallback={<EquityChartSkeleton />}>
      <EquityChart rankPromise={Promise.resolve(example)} />
    </Suspense>
  ),
};

export const Threshold20: Story = {
  render: () => (
    <Suspense fallback={<EquityChartSkeleton step={20} />}>
      <EquityChart rankPromise={Promise.resolve(example)} step={20} />
    </Suspense>
  ),
};

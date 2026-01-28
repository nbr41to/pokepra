import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Suspense } from "react";
import example from "../__mocks__/equity-report.json";
import { EquityReport } from "./equity-report";
import { EquityReportSkeleton } from "./equity-report.skeleton";

const meta = {
  component: EquityReport,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    payload: example,
  },
} satisfies Meta<typeof EquityReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Suspense fallback={<EquityReportSkeleton />}>
      <EquityReport payload={example} />
    </Suspense>
  ),
};

export const Threshold20: Story = {
  render: () => (
    <Suspense fallback={<EquityReportSkeleton step={20} />}>
      <EquityReport payload={example} step={20} />
    </Suspense>
  ),
};

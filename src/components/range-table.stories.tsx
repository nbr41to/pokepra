import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RangeTable } from "./range-table";

const exampleData1 = ["AA", "AKs", "AKo", "KQs", "KQo", "KK", "QQ", "JJ"];
const exampleData2 = [
  { symbol: "AA", prob: 0.95 },
  { symbol: "AKs", prob: 0.68 },
  { symbol: "AKo", prob: 0.65 },
  { symbol: "KQs", prob: 0.4 },
  { symbol: "KQo", prob: 0.65 },
  { symbol: "KK", prob: 0.9 },
  { symbol: "QQ", prob: 0.4 },
  { symbol: "JJ", prob: 0.2 },
];
const exampleData3 = {
  AA: 0.95,
  AKs: 0.68,
  AKo: 0.65,
  KQs: 0.4,
  KQo: 0.65,
  KK: 0.9,
  QQ: 0.4,
  JJ: 0.2,
};

const meta = {
  component: RangeTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    data: exampleData1,
  },
} satisfies Meta<typeof RangeTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: exampleData1,
  },
};
export const Probability1: Story = {
  args: {
    data: exampleData2,
  },
};
export const Probability2: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    data: exampleData3,
  },
};
export const Empty: Story = {
  args: {
    data: [],
  },
};

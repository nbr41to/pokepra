import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HandProbability } from "./hand-probability";

const meta = {
  component: HandProbability,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    handName: { control: "text" },
    probability: { control: "number", min: 0, max: 100, step: 1 },
  },
  args: {
    handName: "Full House",
    probability: 16.5,
  },
} satisfies Meta<typeof HandProbability>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Percent60: Story = {
  args: {
    probability: 60,
  },
};
export const Percent80: Story = {
  args: {
    probability: 80,
  },
};
export const Percent100: Story = {
  args: {
    probability: 100,
  },
};

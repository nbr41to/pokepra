import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OtherHand } from "./other-hand";

const meta = {
  component: OtherHand,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    hand: ["As", "Ks"],
  },
} satisfies Meta<typeof OtherHand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FaceDown: Story = {
  args: {
    reversed: false,
  },
};

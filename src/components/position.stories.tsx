import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Position } from "./position";

const meta = {
  component: Position,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    total: 6,
    playerPosition: 4,
    heroLabel: "YOU",
  },
} satisfies Meta<typeof Position>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SixPlayers: Story = {};

export const NinePlayers: Story = {
  args: {
    total: 9,
    playerPosition: 7,
  },
};

export const CustomLabel: Story = {
  args: {
    heroLabel: "HERO",
  },
};

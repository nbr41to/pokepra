import type { Meta, StoryObj } from "@storybook/react";
import { Board } from "./board";

const meta: Meta<typeof Board> = {
  component: Board,
  tags: ["autodocs"],
  args: {
    disableAnimation: true,
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof Board>;

export const ThreeCards: Story = {
  args: {
    cards: ["As", "Ks", "Qs"],
  },
};

export const Turn: Story = {
  args: {
    cards: ["As", "Ks", "Qs", "Js"],
  },
};

export const River: Story = {
  args: {
    cards: ["As", "Ks", "Qs", "Js", "Ts"],
  },
  parameters: {
    chromatic: { disableSnapshot: false },
  },
};

export const WithAnimation: Story = {
  args: {
    cards: ["As", "Ks", "Qs"],
    disableAnimation: false,
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { Combo } from "./combo";

const meta: Meta<typeof Combo> = {
  component: Combo,
  tags: ["autodocs"],
  args: {
    hand: ["As", "Ks"],
  },
};

export default meta;

type Story = StoryObj<typeof Combo>;

export const Default: Story = {};

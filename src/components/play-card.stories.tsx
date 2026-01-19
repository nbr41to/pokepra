import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PlayCard } from "./play-card";

const meta = {
  component: PlayCard,
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    rs: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: {
    rs: "Ah",
  },
} satisfies Meta<typeof PlayCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
export const Small: Story = {
  args: {
    size: "sm",
  },
};
export const Medium: Story = {
  args: {
    size: "md",
  },
};
export const Large: Story = {
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  args: {
    size: "lg",
  },
};
export const Reversed: Story = {
  args: {
    rs: undefined,
  },
};
export const AllCards: Story = {
  parameters: {
    chromatic: { disableSnapshot: false },
  },
  render: () => {
    const suits = ["s", "h", "d", "c"];
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K",
    ];

    return (
      <div className="flex flex-wrap gap-2">
        <PlayCard size="md" />
        {suits.map((suit) =>
          ranks.map((rank) => (
            <PlayCard key={rank + suit} rs={rank + suit} size="md" />
          )),
        )}
      </div>
    );
  },
};

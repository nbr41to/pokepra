import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { InputCardPalette } from "./input-card-palette";

const meta = {
  component: InputCardPalette,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: fn(),
    onEnter: fn(),
  },
} satisfies Meta<typeof InputCardPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("Ah Ks Qd Jc 10h");

    return (
      <div className="space-y-4">
        <p>value: {value}</p>
        <InputCardPalette
          value={value}
          onChange={(val) => setValue(val)}
          onEnter={fn()}
        />
      </div>
    );
  },
};

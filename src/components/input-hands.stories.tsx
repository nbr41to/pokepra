import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { InputHands } from "./input-hands";

const meta = {
  component: InputHands,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof InputHands>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithState: Story["render"] = (args) => {
  const [value, setValue] = useState(args.value);

  useEffect(() => {
    setValue(args.value);
  }, [args.value]);

  return (
    <div className="w-[360px] space-y-2">
      <InputHands {...args} value={value} onChange={setValue} />
      <div className="text-muted-foreground text-xs">value: {value || "-"}</div>
    </div>
  );
};

export const Default: Story = {
  render: renderWithState,
};

export const WithValue: Story = {
  args: {
    value: "As Ks; Qh Qd; 7c 7d",
  },
  render: renderWithState,
};

export const Interaction: Story = {
  render: renderWithState,
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const doc = canvasElement.ownerDocument;

    await userEvent.click(
      canvas.getByRole("button", { name: /select compare hands/i }),
    );

    const palette = doc.getElementById("input-card-palette");
    expect(palette).toBeTruthy();
    if (!palette) return;

    const buttons = Array.from(palette.querySelectorAll("button"));
    const rankA = buttons.find((button) => button.textContent?.trim() === "A");
    const rankK = buttons.find((button) => button.textContent?.trim() === "K");
    const spade = palette.querySelector("svg.lucide-spade")?.closest("button");

    if (rankA) {
      await userEvent.click(rankA);
    }
    if (spade) {
      await userEvent.click(spade);
    }
    if (rankK) {
      await userEvent.click(rankK);
    }
    if (spade) {
      await userEvent.click(spade);
    }

    await expect(canvas.getByText("value: As Ks")).toBeInTheDocument();
  },
};

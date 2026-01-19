import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TipsText } from "./tips-text";

const meta = {
  component: TipsText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TipsText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <TipsText>
        Monte Carlo methods estimate probability by repeating trials many times.
      </TipsText>
      <TipsText>Fewer trials increase variance in the estimate.</TipsText>
    </div>
  ),
};

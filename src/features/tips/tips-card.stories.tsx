import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TipsCard } from "./tips-card";
import { TipsText } from "./tips-text";

const meta = {
  component: TipsCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TipsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <TipsCard>
        <h3 className="font-semibold">Tips Card</h3>
        <TipsText>Default card surface for tips pages.</TipsText>
      </TipsCard>
      <TipsCard>
        <TipsText>Compact size</TipsText>
      </TipsCard>
    </div>
  ),
};

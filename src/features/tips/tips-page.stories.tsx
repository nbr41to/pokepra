import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TipsPage } from "./tips-page";

const meta = {
  component: TipsPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TipsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TipsPage>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        Tips page container
      </div>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        Second section
      </div>
    </TipsPage>
  ),
};

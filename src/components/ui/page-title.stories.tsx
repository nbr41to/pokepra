import type { Meta, StoryObj } from "@storybook/react";
import { PageTitle } from "./page-title";

const meta: Meta<typeof PageTitle> = {
  component: PageTitle,
  tags: ["autodocs"],
  args: {
    title: "Page Title",
    description:
      "ベージの説明文がここに入ります。ベージの説明文がここに入ります。ベージの説明文がここに入ります。ベージの説明文がここに入ります。",
    hidable: false,
  },
};

export default meta;

type Story = StoryObj<typeof PageTitle>;

export const Default: Story = {
  args: {
    description: undefined,
  },
};
export const WithDescription: Story = {};
export const Hidable: Story = {
  args: {
    description:
      "ベージの説明文がここに入ります。ベージの説明文がここに入ります。ベージの説明文がここに入ります。ベージの説明文がここに入ります。",
    hidable: true,
  },
};

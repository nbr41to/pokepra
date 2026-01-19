import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, within } from "storybook/test";
import { HeroActionArea } from "./index";

const meta = {
  component: HeroActionArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    hand: ["As", "Ks"],
    onOpenHand: fn(),
    onFold: fn(),
    onDoubleTap: fn(),
    doubleTapActionName: "Double Tap",
  },
} satisfies Meta<typeof HeroActionArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithContainer: Story["render"] = (args) => (
  <div className="w-[360px]" data-testid="hero-action-area">
    <HeroActionArea {...args} />
  </div>
);

export const Default: Story = {
  render: renderWithContainer,
};

export const Interaction: Story = {
  render: renderWithContainer,
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId("hero-action-area").firstElementChild;

    if (!(container instanceof HTMLElement)) {
      throw new Error("HeroActionArea container not found");
    }

    container.setPointerCapture = () => {};
    container.releasePointerCapture = () => {};
    container.getBoundingClientRect = () =>
      ({
        width: 360,
        height: 208,
        left: 0,
        top: 0,
        right: 360,
        bottom: 208,
        x: 0,
        y: 0,
        toJSON: () => "",
      }) as DOMRect;

    fireEvent.pointerDown(container, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 10,
      clientY: 150,
    });
    fireEvent.pointerMove(container, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 260,
      clientY: 150,
    });
    fireEvent.pointerUp(container, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 260,
      clientY: 150,
    });

    await expect(args.onOpenHand).toHaveBeenCalled();

    fireEvent.pointerDown(container, {
      pointerId: 2,
      pointerType: "touch",
      clientX: 60,
      clientY: 150,
      timeStamp: 1000,
    });
    fireEvent.pointerDown(container, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 60,
      clientY: 150,
      timeStamp: 1200,
    });

    await expect(args.onDoubleTap).toHaveBeenCalled();

    fireEvent.pointerDown(container, {
      pointerId: 4,
      pointerType: "touch",
      clientX: 300,
      clientY: 190,
    });
    fireEvent.pointerMove(container, {
      pointerId: 4,
      pointerType: "touch",
      clientX: 300,
      clientY: 110,
    });
    fireEvent.pointerUp(container, {
      pointerId: 4,
      pointerType: "touch",
      clientX: 300,
      clientY: 110,
    });

    await expect(args.onFold).toHaveBeenCalled();
  },
};

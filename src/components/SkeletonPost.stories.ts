import type { Meta, StoryObj } from "storybook-solidjs";
import { within } from "@storybook/test";
import { SkeletonPost } from "./SkeletonPost";
import { DEFAULT_CLASS } from "./SkeletonPost";

const meta = {
  title: "components/SkeletonPost",
  component: SkeletonPost,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/7.0/solid/writing-docs/docs-page
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/solid/configure/story-layout
    layout: "centered",
  },
} satisfies Meta<typeof SkeletonPost>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Generic: Story = {
  args: {
    class: `${DEFAULT_CLASS}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.getByRole("div");
  },
};

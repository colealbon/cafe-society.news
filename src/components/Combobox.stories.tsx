import type { Meta, StoryObj } from "storybook-solidjs";
import { within, userEvent } from "@storybook/test";
import "virtual:uno.css";
import { DEFAULT_CLASS, Combobox } from "./Combobox";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: "components/Combobox",
  parameters: {
    layout: "centered",
  },
  component: Combobox,
  tags: ["autodocs"],
  //  ,
  //   argTypes: {
  //     name: {action: "clicked"}
  //   },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Generic: Story = {
  args: {
    name: "test name",
    ariaLabel: "test areaLabel",
    options: ["one", "two", "three"],
    class: `${DEFAULT_CLASS}`,
    multiple: true,
    placeholder: '...search'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId("combobox"), "test input");
  },
};

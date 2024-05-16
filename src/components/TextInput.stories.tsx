import type { Meta, StoryObj } from 'storybook-solidjs';
import { within, userEvent } from '@storybook/testing-library';
import "virtual:uno.css"
import {
  DEFAULT_CLASS,
  TextInput
} from './TextInput'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'components/TextInput',
  parameters: {
    layout: 'centered'
  },
  component: TextInput,
  tags: ['autodocs'],
  argTypes: {
    name: {action: "clicked"}
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Generic: Story = {
  args: {
    name: 'test name',
    value: 'test value',
    class: `${DEFAULT_CLASS}`
  },
  play: async({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByTestId('textinput'), 'test input');
    // const button = await canvas.getByRole("button");
    // await userEvent.click(button);
  }
};
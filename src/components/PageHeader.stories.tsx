import type { Meta, StoryObj } from 'storybook-solidjs';
import { within, userEvent } from '@storybook/testing-library';
import "virtual:uno.css"
import {DEFAULT_CLASS} from './PageHeader'

import { PageHeader } from './PageHeader';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  parameters: {
    layout: 'centered',
  },
  component: PageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Generic: Story = {
  args: {
    class: `${DEFAULT_CLASS}`,
    children: 'test page header'
  },
  play: async({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.getByRole("h1");
  }
};
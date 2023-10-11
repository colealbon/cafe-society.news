import type { Meta, StoryObj } from 'storybook-solidjs';
import "virtual:uno.css"

import { Button } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    'onClick': {control: ''}
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Default: Story = {
  args: {
    label: 'Button',
    class: 'transition-colors rounded-full bg-slate200 color-black border-transparent hover-bg-black hover-color-white'
  },
};


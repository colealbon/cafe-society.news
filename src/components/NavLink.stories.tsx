import type { Meta, StoryObj } from 'storybook-solidjs';
import { within, userEvent } from '@storybook/testing-library';
import "virtual:uno.css"
import { Router } from "@solidjs/router";
import { NavLink } from './NavLink'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'components/NavLink',
  parameters: {
    layout: 'centered'
  },
  component: NavLink,
  decorators: [
    (Story) => (
    <div class='bg-black p7 rounded-7'>
      <Router>
        <Story />
      </Router>
    </div>

    ),
  ],

  tags: ['autodocs'],
  argTypes: {
    onClick: {action: "clicked"}
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Basic: Story = {
  args: {
    href:'/',
    class:'no-underline text-left text-xl text-white border-none transition-all bg-transparent hover-bg-transparent hover-text-slate-500 hover-text-4v xl',
    children: 'home'
  },
  play: async({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = await canvas.getByRole("link");
    await userEvent.click(link);
  }
};
import type { Meta, StoryObj } from 'storybook-solidjs';
import { within, userEvent } from '@storybook/testing-library';
import "virtual:uno.css"
import { Router } from "@solidjs/router";
import { NavBar } from './NavBar'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'components/NavBar',
  parameters: {
    layout: 'centered'
  },
  component: NavBar,
  decorators: [
    (Story) => (
    <div class='bg-black p7 rounded-7'>
      <Router>
      <div class={`font-sans`}><Story /></div>
      </Router>
    </div>
    ),
  ],

  tags: ['autodocs'],
  argTypes: {

  },
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
export const Basic: Story = {
  args: {
    navIsOpen: () => true,
    toggleNav: () => null,
    mutateRssPosts: () => [],
    setNavIsOpen: (newState: boolean) => null,
    setSelectedTrainLabel: (label: string) => null,
    checkedTrainLabels: () => []
  },
  play: async({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = await canvas.getByTestId("classifiers");
    await userEvent.click(link);
  }
};
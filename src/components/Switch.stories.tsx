import type { Meta, StoryObj } from 'storybook-solidjs';
import { within, userEvent } from '@storybook/testing-library';
import "virtual:uno.css"
import {DEFAULT_CLASS} from './Switch'

import { Switch } from './Switch';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  parameters: {
    layout: 'centered'
  },
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    onChange: {action: "clicked"}
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;
// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args

export const Generic: Story = {
    args: {
      class: `${DEFAULT_CLASS} font-sans flex display-inline`,
      title: 'test title',
      checked: true,
      disabled: false
    },
    play: async({ canvasElement }) => {
      const canvas = within(canvasElement);
      const switchControl = await canvas.getByRole("switch");
      await userEvent.click(switchControl);
    }
  };

  export const DisabledGeneric: Story = {
    args: {
      class: `${DEFAULT_CLASS} font-sans flex display-inline`,
      title: 'test title',
      checked: true,
      disabled: true
    },
    play: async({ canvasElement }) => {
      const canvas = within(canvasElement);
      const switchControl = await canvas.getByRole("switch");
      await userEvent.click(switchControl);
    }
  };

export const Checked: Story = {
  args: {
    label: 'checked',
    class: `${DEFAULT_CLASS} font-sans flex display-inline p-2`,
    title: 'test title',
    checked: true,
    disabled: false
  },
  play: async({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchControl = await canvas.getByRole("switch");
    await userEvent.click(switchControl);
  }
};

export const Unchecked: Story = {
    args: {
      label: 'unchecked',
      class: `${DEFAULT_CLASS} font-sans flex display-inline p-2`,
      title: 'test title',
      checked: false,
      disabled: false
    },
    play: async({ canvasElement }) => {
      const canvas = within(canvasElement);
      const switchControl = await canvas.getByRole("switch");
      await userEvent.click(switchControl);
    }
  };
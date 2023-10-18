import { Component, mergeProps, splitProps} from 'solid-js';
import { Button as KobalteButton } from "@kobalte/core";

export interface ButtonProps {
  title: string;
  label?: string;
  disabled?: boolean;
  onClick: () => void;
  class?: string;
  children?: any;
}
export const DEFAULT_CLASS="p-2 mr-2 ml-2 text-3xl border-none transition-colors rounded-full bg-transparent hover-bg-black hover-color-white transition-colors"
const DEFAULT_LABEL = 'default'

export const Button: Component<ButtonProps> = (props) => {
  props = mergeProps(
    {
      class: `${props.class} ${DEFAULT_CLASS}`,
      label: DEFAULT_LABEL,
    }, props);

  const [local, rest] = splitProps(props, [
    'label',
    'onClick',
    'class',
    'disabled',
    'children'
  ]);

  return (
    <KobalteButton.Root
      {...rest}
      type="button"
      onclick={() => local.onClick()}
      class={local.class}
    >
      {local.children || local.label}
    </KobalteButton.Root>
  );
};
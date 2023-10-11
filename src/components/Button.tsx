import { Component, mergeProps, splitProps } from 'solid-js';

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  class?: string;
}
export const Button: Component<ButtonProps> = (props) => {
  props = mergeProps({class: "transition-colors rounded-full bg-slate200 color-black border-transparent hover-bg-black hover-color-white" }, props);
  const [local, rest] = splitProps(props, [
    'label',
    'onClick',
    'class'
  ]);

  return (
    <button
      {...rest}
      type="button"
      onclick={() => local.onClick}
      class={local.class}
    >
      {local.label}
    </button>
  );
};

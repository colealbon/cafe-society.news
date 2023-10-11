import { Component, mergeProps, splitProps } from 'solid-js';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  class?: string;
  children?: string | Element;
}
const DEFAULT_CLASS= `
  text-xl
  border-transparent
  transition-colors
  rounded-full
  bg-slate700
  color-white
  hover-bg-black
  hover-color-white
`
const DEFAULT_LABEL = 'default'

export const Button: Component<ButtonProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
      label: DEFAULT_LABEL,
      onClick: () => alert(DEFAULT_LABEL)
    }, props);
  const [local, rest] = splitProps(props, [
    'label',
    'onClick',
    'class'
  ]);

  return (
    <button
      {...rest}
      type="button"
      onclick={() => local.onClick()}
      class={`${DEFAULT_CLASS} ${local.class}`}
    >
      {local.label !== '' ? local.label : DEFAULT_LABEL}
    </button>
  );
};

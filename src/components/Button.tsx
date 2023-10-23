import { Component, mergeProps, splitProps} from 'solid-js';
export interface ButtonProps {
  title?: string;
  label: Element | any;
  disabled?: boolean;
  onClick: () => void;
  class?: string;
  children?: any;
}
export const DEFAULT_CLASS="prose dark:prose-invert text-3xl border-none transition-colors bg-transparent hover-text-slate-500 aspect-square"            

export const Button: Component<ButtonProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'label',
    'onClick',
    'class',
    'disabled',
    'children'
  ]);

  return (
    <button {...local} class={`${local.class} ${DEFAULT_CLASS}`}>
      {local.label}
    </button>
  );
};
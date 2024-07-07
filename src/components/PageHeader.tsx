import { Component, mergeProps, splitProps } from 'solid-js';

export interface PageHeaderProps {
  children?: string | Element;
  class?: string;
  testid?: string;
}

export const DEFAULT_CLASS="font-sans uppercase"

export const PageHeader: Component<PageHeaderProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'class',
    'children',
    'testid'
  ]);

  return (
    <div class='ustify-center'>
        <div class='h-20px'></div>
        <h1 data-testid={local.testid} class={`${local.class} ${DEFAULT_CLASS}`}>{local.children}</h1>
    </div>
  );
};
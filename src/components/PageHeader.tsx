import { Component, mergeProps, splitProps } from 'solid-js';

export interface PageHeaderProps {
  children?: string | Element;
  class?: string;
}

export const DEFAULT_CLASS="font-sans uppercase"

export const PageHeader: Component<PageHeaderProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'class',
    'children'
  ]);

  return (
    <div class='sticky top-0px justify-center'>
        <div class='h-20px bg-white'></div>
        <h1 class={`${local.class} ${DEFAULT_CLASS} pl-60px pt-2 pb-2 mt-0px bg-white z-50 mb-0`}>{local.children}</h1>
        <div class='bg-gradient-to-b from-white p-6' />
    </div>
  );
};
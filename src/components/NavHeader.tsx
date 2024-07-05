import { Component, mergeProps, splitProps } from 'solid-js';
import {Button} from './Button';

export interface NavHeaderProps {
  children?: string | Element | null;
  class?: string;
  testid?: string;
}

export const DEFAULT_CLASS="font-sans uppercase"

export const NavHeader: Component<NavHeaderProps> = (props) => {
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
    <div class='sticky top-0px h-30px bg-inherit'>
      <div class='h-20px bg-white'>
        <Button onClick={toggleNav{ label={local.children} data-testid={local.testid} class={`${local.class} ${DEFAULT_CLASS} mt-0px bg-white  mb-0`} />
      </div>
      <div class='bg-gradient-to-b from-white p-6' />
    </div>
  );
};
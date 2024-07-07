import { Component, mergeProps, splitProps } from 'solid-js';
import { A } from "@solidjs/router";

export interface NavLinkProps {
  onClick: () => void;
  class?: string;
  children?: string | Element;
  href: string;
  testid?: string;
}
export const DEFAULT_CLASS="bg-inherit"

export const NavLink: Component<NavLinkProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'children',
    'onClick',
    'class',
    'href',
    'testid'
  ]);

  return (
    <A
      {...rest}
      type="link"
      onclick={() => local.onClick()}
      class={local.class}
      href={local.href}
      data-testid={props.testid}
    >
      {local.children}
    </A>
  );
};
import { Component, mergeProps, splitProps } from 'solid-js';
import { A } from "@solidjs/router";

export interface NavLinkProps {
  onClick: () => void;
  class?: string;
  children?: string | Element;
  href: string;
}
const DEFAULT_CLASS="no-underline text-left text-xl text-white border-none transition-all bg-transparent hover-text-slate-500 hover-text-4v xl"

export const NavLink: Component<NavLinkProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'children',
    'onClick',
    'class',
    'href'
  ]);

  return (
    <A
      {...rest}
      type="link"
      onclick={() => local.onClick()}
      class={local.class}
      href={local.href}
    >
      {local.children}
    </A>
  );
};
import { Component, mergeProps, splitProps} from 'solid-js';
import {
    Collapsible as KobalteCollapsible
  } from "@kobalte/core";
export interface CollapsibleProps {
  // checked: boolean;
  // label: string;
  // onChange: () => void;
  // class?: string;
  // disabled?: boolean;
  children: Element[] 
}
export const DEFAULT_CLASS=''

export const Collapsible: Component<CollapsibleProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    // 'checked',
    // 'onChange',
    // 'label',
    // 'class',
    // 'disabled',
    'children'
  ]);

  return (
    <KobalteCollapsible.Root {...local}>
      {props.children}
    </KobalteCollapsible.Root>
  );
};
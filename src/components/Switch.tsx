import { Component, mergeProps, splitProps} from 'solid-js';
import {
    Switch as KobalteSwitch
  } from "@kobalte/core";
export interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: () => void;
  class?: string;
  disabled?: boolean;
}
export const DEFAULT_CLASS='hover-text-slate-400'

export const Switch: Component<SwitchProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'checked',
    'onChange',
    'label',
    'class',
    'disabled',
  ]);

  return (
    <KobalteSwitch.Root {...local}>
        <KobalteSwitch.Input class="switch__input ml-1" />
        <KobalteSwitch.Control class="switch__control">
        <KobalteSwitch.Thumb class="switch__thumb" />
        </KobalteSwitch.Control>
        <KobalteSwitch.Label class="switch__label"><div class={local.class}>{local.label}</div></KobalteSwitch.Label>
    </KobalteSwitch.Root>
  );
};
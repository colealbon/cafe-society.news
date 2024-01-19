import {
  Component,
  mergeProps,
  splitProps,
  createSignal,
  For,
} from 'solid-js';
import { Combobox as kobalteCombobox} from "@kobalte/core";
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { TiArrowUnsorted } from 'solid-icons/ti'
import { Button } from './Button'

export interface ComboboxProps {
  options: any[],
  placeholder: string,
  children?: string | Element;
  class?: string;
}

export const DEFAULT_CLASS=""

export const Combobox: Component<ComboboxProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'class',
    'children'
  ]);
// export const Combobox: Component<> = (props) => {
  const [values, setValues] = createSignal(["Blueberry", "Grapes"]);
  return (
    <>
      <kobalteCombobox.Root<string>
        class="combobox"
        multiple
        options={props.options}
        value={values()}
        onChange={setValues}
        placeholder={props.placeholder}
        itemComponent={props => (
          <kobalteCombobox.Item item={props.item} class="combobox__item w-200px">
            <kobalteCombobox.ItemLabel>{props.item.rawValue}</kobalteCombobox.ItemLabel>
            <kobalteCombobox.ItemIndicator class="combobox__item-indicator">
              <CheckIcon />
            </kobalteCombobox.ItemIndicator>
          </kobalteCombobox.Item>
        )}
      >
        <kobalteCombobox.Control<string>
          aria-label="Fruits"
          class="bg-white combobox__control" 
        >
          {state => (
            <>
              <div>
                <For each={state.selectedOptions()}>
                  {option => (
                  <div class='align-bottom flex flex-row' onPointerDown={e => e.stopPropagation()}>
                    <Button
                      title={`remove ${option}`}
                      onClick={() => {
                        state.remove(option)
                      }}
                      label={option}
                    />
                  </div>
                  )}
                </For>
                <kobalteCombobox.Input />
              </div>
              <Button onPointerDown={e => e.stopPropagation()} onClick={state.clear}>
                <span>x</span>
              </Button>
              <kobalteCombobox.Trigger
                class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'
              >
                <kobalteCombobox.Icon>
                  <TiArrowUnsorted />
                </kobalteCombobox.Icon>
              </kobalteCombobox.Trigger>
            </>
          )}
        </kobalteCombobox.Control>
        <kobalteCombobox.Portal>
          <kobalteCombobox.Content  class="combobox__content">
            <kobalteCombobox.Listbox class="combobox__listbox font-sans"/>
          </kobalteCombobox.Content>
        </kobalteCombobox.Portal>
      </kobalteCombobox.Root>
    </>
  );
}

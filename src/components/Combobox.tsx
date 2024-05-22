import {
  Component,
  mergeProps,
  splitProps,
  createSignal,
  For,
  Setter
} from 'solid-js'
import {
  Combobox as KobalteCombobox
} from "@kobalte/core/combobox"
import {
  Control,
  Input,
  Trigger,
  Icon,
  Portal,
  Content,
  Listbox,
  Item,
  ItemIndicator,
  ItemLabel
} from "@kobalte/core/combobox"

import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { TiArrowUnsorted } from 'solid-icons/ti'
// import { Button } from './Button'

export interface ComboboxProps {
  options: any[],
  placeholder: string,
  children?: string | Element
  class?: string
  ariaLabel?: string
  testid?: string
  multiple: boolean
  onChange?: any
  onOpenChange?: any
  onInputChange?: any
}

export const DEFAULT_CLASS=""

export const Combobox: Component<ComboboxProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
      testid: 'combobox'
    }, props)

  const [local, rest] = splitProps(props, [
    'class',
    'children',
    'multiple',
    'options',
    'ariaLabel',
    'testid',
    'placeholder',
    'onChange',
    'onOpenChange',
    'onInputChange'
  ])
  return (
    <KobalteCombobox 
      {...local}
      data-testid={local.testid}
      itemComponent={props => (
        <Item item={props.item} class="combobox__item">
          <ItemLabel>{props.item.rawValue}</ItemLabel>
          <ItemIndicator class="combobox__item-indicator">
            <CheckIcon />
          </ItemIndicator>
        </Item>
      )}
    >
      <Control class="combobox__control" aria-label={local.ariaLabel}>
        <Input class="combobox__input" />
        <Trigger class="combobox__trigger">
          <Icon class="combobox__icon">
            <TiArrowUnsorted />
          </Icon>
        </Trigger>
      </Control>
      <Portal>
        <Content class="combobox__content">
          <Listbox class="combobox__listbox" />
        </Content>
      </Portal>
    </KobalteCombobox>
  )
}
export default Combobox
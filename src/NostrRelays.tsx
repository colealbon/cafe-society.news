import {
  For
} from 'solid-js';

import {
  Button,
  Separator,
  Switch,
  Collapsible
} from "@kobalte/core";

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'

import { NostrRelay } from './db-fixture'
const NostrRelays = (props: {
  nostrRelays: NostrRelay[],
  // eslint-disable-next-line no-unused-vars
  putNostrRelay: (nostrRelay: NostrRelay) => void,
  // eslint-disable-next-line no-unused-vars
  removeNostrRelay: (nostrRelay: NostrRelay) => void
}) => {

  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true)
  });

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (group.isSubmitted) {
      // console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        checked:true
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newNostrRelay => {
      const newNostrRelayObj: NostrRelay = {
        ...{
          id: '',
          checked: true
        },
        ...newNostrRelay
      }
      props.putNostrRelay(newNostrRelayObj)
    })

    group.setValue({
      id:'',
      checked:true
    })
  };

  const handleToggleChecked = (id: string) => {
    const valuesForSelectedFeed = props.nostrRelays
    .find(nostrRelayEdit => nostrRelayEdit['id'] === id)
    const newValueObj = (Object.assign(
      {id: ''},
      {
        ...valuesForSelectedFeed
      },
      {checked: !group.value.checked}
    ))
    group.setValue (newValueObj)
    props.putNostrRelay(newValueObj)
  }

  return (
    <div class='fade-in'>
      <h1>Edit Nostr Relays</h1>
      <Separator.Root />
    <div>
    <form onSubmit={onSubmit}>
      <label for="id">URL</label>
      <div class='w-9/10'><TextInput name="id" control={group.controls.id} /></div>
    </form>
</div>
<div>
  <h4 class="text-muted">NostrRelays</h4>
    <For each={props.nostrRelays}>
      {(nostrRelay) => (
        <Collapsible.Root class="collapsible" defaultOpen={true}>
          <Collapsible.Content class='collapsible-content'>
            <p class='flex justify-start'>
              <Button.Root class='border-none text-red-900 hover-text-white bg-transparent hover-bg-red-900 rounded-full m-0' onClick={() => {
                setTimeout(() => {
                  props.removeNostrRelay(nostrRelay)
                }, 300)
              }}>
                <Collapsible.Trigger class='bg-inherit ease-in-out rounded-full border-inherit hover-text-white hover-bg-red-900 m-0 animate-fade-in animate-duration-1s'>
                  ✕
                </Collapsible.Trigger>
              </Button.Root>
              <Switch.Root
                class="flex display-inline"
                checked={nostrRelay.checked}
                onChange={() => handleToggleChecked(`${nostrRelay.id}`)}
              >
                <Switch.Input class="switch__input ml-1" />
                <Switch.Control class="switch__control">
                  <Switch.Thumb class="switch__thumb" />
                </Switch.Control>
                <Switch.Label class="switch__label"><div class='hover-text-slate-400 rounded-full m-1'>{nostrRelay.id}</div></Switch.Label>
              </Switch.Root>
            </p>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </For>
  </div>
</div>
  )
}
export default NostrRelays;

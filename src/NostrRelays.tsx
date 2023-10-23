import {
  For
} from 'solid-js';

import {
  Collapsible
} from "@kobalte/core";

import { Switch } from './components/Switch'
import {Button} from './components/Button'

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
    <div>
    <form onSubmit={onSubmit}>
      <label class='hidden' for="id">URL</label>
      <div class='w-9/10'>
        <TextInput name="id" control={group.controls.id} />
      </div>
    </form>
</div>
<div>
  <For each={props.nostrRelays}>
    {(nostrRelay) => (
        <Collapsible.Root class="collapsible" defaultOpen={true}>
          <Collapsible.Content class='collapsible-content'>
            <p class='flex justify-start'>
              <Button 
                onClick={() => props.removeNostrRelay(nostrRelay)}
                label='✕'
              >
              </Button>
              <Switch 
                class="flex display-inline"
                checked={nostrRelay.checked}
                onChange={() => handleToggleChecked(`${nostrRelay.id}`)}
                label={nostrRelay.id}
              />
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

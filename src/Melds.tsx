import { 
  Component,
  createSignal,
  createEffect,
  mergeProps,
  splitProps,
  For,
  Show
} from 'solid-js';
import {
  NostrKey
} from './NostrKeys'
import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import { Combobox } from './components/Combobox';
import { PageHeader } from './components/PageHeader';
import { TextInput } from './components/TextInput';
import { nip19 } from 'nostr-tools'

export interface MeldProps {
  nostrKeys: NostrKey[];
  children?: string | Element;
  class?: string;
}


const Melds: Component<MeldProps> = (props: MeldProps) => {
  const [pubkeyOptions, setPubkeyOptions] = createSignal([]);
  const [subscriberPubkeys, setSubscriberPubKeys] = createSignal([]);
  const theNostrKeys = props.nostrKeys.map(nostrKey => nostrKey.publicKey)
  console.log(theNostrKeys)

  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true),
    subscriberPubKeys: createFormControl([])
  });
  const onSubmit = async (event: Event) => {
    try {
      event.preventDefault()
    } catch (err) {
      //pass
    }
    if (group.isSubmitted) {
      console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        checked:true,
        subscriberPubKeys:['']
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newMeld => {
      const newMeldObj: {
        id: string,
        checked: boolean,
        subscriberPubKeys: string[]
      } = {
        ...{
          id: '',
          checked: true,
          subscriberPubKeys: []
        },
        ...newMeld
      }
      newMeldObj.subscriberPubKeys = subscriberPubkeys()
      //props.putMeld(newMeldObj)
    })
    group.setValue({
      id:'',
      checked:true,
      subscriberPubKeys: []
    })
    setSubscriberPubKeys([])
  };
  
  createEffect(() => {
    const newPubkeyOptions = props.nostrKeys
      .slice()
      .map((nostrkey) => nip19.npubEncode(nostrkey.publicKey))
    setPubkeyOptions(newPubkeyOptions)
  })
  return (
    <>
      <PageHeader>Melds</PageHeader>
      <form onSubmit={onSubmit}>
        <label for="id">Meld label:</label>
        <TextInput name="id" control={group.controls.id} />
        <Combobox 
          placeholder="recipients/subscribers"
          options={pubkeyOptions()}
        />
      </form>
    </>
  )
}
export default Melds
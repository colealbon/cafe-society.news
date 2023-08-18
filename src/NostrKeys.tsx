import {
  For
} from 'solid-js';

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'
import { Link, Separator } from "@kobalte/core";

import {
  VsAdd,
  VsTrash
} from 'solid-icons/vs'
import { CgErase } from 'solid-icons/cg'
import {
  generatePrivateKey,
  getPublicKey
} from 'nostr-tools'
import { NostrKey } from './db-fixture'

const NostrKeys = (props: {
  nostrKeys: NostrKey[],
  // eslint-disable-next-line no-unused-vars
  putNostrKey: (newKey: NostrKey) => void,
  // eslint-disable-next-line no-unused-vars
  removeNostrKey: (newKey: NostrKey) => void
}) => {


  const group = createFormGroup({
    publicKey: createFormControl(""),
    secretKey: createFormControl(""),
    label: createFormControl(""),
    lightning: createFormControl(""),
    follow: createFormControl(false),
    ignore: createFormControl(false)
  });

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (group.isSubmitted) {
      console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        publicKey:'',
        secretKey:'',
        label:'',
        lightning:'',
        follow: false,
        ignore: false
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .map((newKey) => {
      if (`${newKey.publicKey}${newKey.secretKey}` == 'undefinedundefined') {
        const secretKey = generatePrivateKey()
        newKey.secretKey = secretKey
      }
      return newKey
    })
    .map((newKey) => {
      if (`${newKey.publicKey}` == 'undefined') {
          newKey.publicKey = getPublicKey(`${newKey.secretKey}`)
      }
      return newKey
    })
    .filter((newKey) => `${newKey.publicKey}` != 'undefined')
    .forEach(newKey => {
      const newNostrKey: NostrKey = {...{publicKey: '', ...newKey}}
      props.putNostrKey(newNostrKey)
    })
    group.setValue({
      publicKey:'',
      secretKey:'',
      label:'',
      lightning:'',
      follow: false,
      ignore: false
    })
  };

  const handleKeyClick = (publicKey: string) => {
    const valuesForSelectedKey = props.nostrKeys
      .find(nostrKeyEdit => nostrKeyEdit['publicKey'] === publicKey)
    group.setValue(Object.assign({
        publicKey:'',
        secretKey:'',
        label:'',
        lightning:'',
        follow: false,
        ignore: false
      }, valuesForSelectedKey))
  }

  const handleEraseClick = () => {
    group.setValue({
        publicKey:'',
        secretKey:'',
        label:'',
        lightning:'',
        follow: false,
        ignore: false
      })
  }

  return (
  <div class='fade-in'>
    <h1>Edit Nostr Keys</h1>
    <Separator.Root />
      <form onSubmit={onSubmit}>
        <label for="publicKey">Public Key</label>
        <TextInput name="publicKey" control={group.controls.publicKey} />
        <label for="secretKey">Secret Key</label>
        <TextInput name="secretKey" control={group.controls.secretKey} />
        <div color='orange'>(Not secure - do not paste sensitive keys)</div>
        <label for="label">Label</label>
        <TextInput name="label" control={group.controls.label} />
        <label for="lightning">Lightning</label>
        <TextInput name="lightning" control={group.controls.lightning} />
        <div class='flex flex-row'>
        <div>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            onSubmit(event)
          }}>
            <VsAdd />
          </Link.Root>
        </div>
        <div >
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleEraseClick()
          }}>
            <CgErase />
          </Link.Root>
        </div>
        </div>
      </form>

      <div>
        <h4 class="text-muted">Keys</h4>
        <For each={props.nostrKeys}>
          {(nostrKey) => (
            <div style={
              {
                'width': '100%',
                'display': 'flex',
                'flex-direction': 'row',
                'justify-content': 'flex-start',
                'font-size': '25px',
              }
            }>
              <div style={
                {
                  'padding': '8px 8px 8px 32px',
                  'text-decoration': 'none',
                  'font-size': '25px',
                  'color': '#818181',
                  'display': 'block',
                  'transition':'0.3s'
                }}>
                <Link.Root onClick={(event) => {
                  event.preventDefault()
                  props.removeNostrKey(nostrKey)
                }}>
                  <VsTrash onClick={() => props.removeNostrKey(nostrKey)} />
                </Link.Root>
              </div>
              <div style={
                {
                  'padding': '8px 8px 8px 32px',
                  'text-decoration': 'none',
                  'font-size': '25px',
                  'color': '#818181',
                  'display': 'block',
                  'transition':'0.3s'
                }}>
                <Link.Root onClick={(event) => {
                  event.preventDefault()
                  handleKeyClick(nostrKey.publicKey)
                }}>
                  {nostrKey.label || nostrKey.publicKey && `${nostrKey.publicKey?.substring(0,5)}...${nostrKey.publicKey?.substring(nostrKey.publicKey?.length - 5, nostrKey.publicKey?.length)}` || ''}
                </Link.Root>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
export default NostrKeys;
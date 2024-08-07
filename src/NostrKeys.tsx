import {
  For
} from 'solid-js';

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import { TextInput } from './components/TextInput'
import { Link } from "@kobalte/core";
import { nip19 } from 'nostr-tools'
import * as Y from 'yjs'

import {
  VsAdd
} from 'solid-icons/vs'
import { CgErase } from 'solid-icons/cg'
import {
  generatePrivateKey,
  getPublicKey
} from 'nostr-tools'

import { PageHeader } from './components/PageHeader'
import { Button } from './components/Button'

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

  const handleClickAdd = () => {
    alert("you clicked add")
  }

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
  // const ydoc = new Y.Doc()
  // const ymap = ydoc.getMap()
  // ymap.set('keyA', 'valueA')
  
  // // Create another Yjs document (simulating a remote user)
  // // and create some conflicting changes
  // const ydocRemote = new Y.Doc()
  // const ymapRemote = ydocRemote.getMap()
  // ymapRemote.set('keyB', 'valueB')
  
  // // Merge changes from remote
  // const update = Y.encodeStateAsUpdate(ydocRemote)
  // Y.applyUpdate(ydoc, update)
  
  // // Observe that the changes have merged
  // console.log(ymap.toJSON()) // => { keyA: 'valueA', keyB: 'valueB' }


  return (
  <div class='fade-in'>
    <PageHeader>Nostr Keys</PageHeader>
    <div>
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
            <Button label={<VsAdd />} onClick={() => {
              handleClickAdd()
            }} />
          </div>
          <div >
            <Link.Root onClick={(event: Event) => {
              event.preventDefault()
              handleEraseClick()
            }}>
              <CgErase />
            </Link.Root>
          </div>
          <div>
            <Link.Root onClick={(event: Event) => {
              event.preventDefault()
              onSubmit(event)
            }}>
              <div>submit</div>
            </Link.Root>
          </div>

        </div>
      </form>
      <h4 class="text-muted">Keys</h4>
      <div class='h-50 overflow-y-auto'>
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
                <Button 
                  onClick={() => props.removeNostrKey(nostrKey)}
                  label='✕'
                />
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
                <Button 
                  onClick={() => handleKeyClick(nostrKey.publicKey)}
                  label={nostrKey.label || nip19.npubEncode(nostrKey.publicKey)}
                />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
    </div>
  )
}
export default NostrKeys;
export interface NostrKey {
  publicKey: string;
  secretKey?: string;
  label?: string;
  lightningAddress?: string;
  follow?: boolean;
  ignore?: boolean;
}

// const nostrClient = relayInit("ws://0.0.0.0:8080");
// await nostrClient.connect();
// const key = generatePrivateKey();

// const roomId = await createNostrCRDTRoom(ydoc, nostrClient, key, "demo");

// const yarray = ydoc.getArray("count");

// observe changes of the sum
// yarray.observe((event) => {
//   // print updates when the data changes
//   console.log("new sum: " + yarray.toArray().reduce((a, b) => a as number + b as number));
// });

// // add 1 to the sum
// yarray.push([1]); // => "new sum: 1"

// const nostrProvider = new NostrProvider(
//   ydoc,
//   nostrClient,
//   key,
//   roomId,
//   "demo"
// );
// await nostrProvider.initialize();
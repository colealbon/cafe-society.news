import chloride from 'chloride'

import {
  For
} from 'solid-js';
import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import { TextInput } from './components/TextInput'
import { Link } from "@kobalte/core";
import {
  VsAdd
} from 'solid-icons/vs'
import { CgErase } from 'solid-icons/cg'
import { PageHeader } from './components/PageHeader'
import { Button } from './components/Button'

const EncryptionKeys = (props: {
  encryptionKeys: EncryptionKey[],
  // eslint-disable-next-line no-unused-vars
  putEncryptionKey: (newKey: EncryptionKey) => void,
  // eslint-disable-next-line no-unused-vars
  removeEncryptionKey: (newKey: EncryptionKey) => void
}) => {
  const group = createFormGroup({
    publicKey: createFormControl(""),
    secretKey: createFormControl(""),
    label: createFormControl("")
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
        label:''
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    // .map((newKey) => {
    // //   if (`${newKey.publicKey}${newKey.secretKey}` == 'undefinedundefined') {
    // //     const secretKey = generatePrivateKey()
    // //     newKey.secretKey = secretKey
    // //   }
    // //   return newKey
    // })
    // .map((newKey) => {
    //   if (`${newKey.publicKey}` == 'undefined') {
    //       newKey.publicKey = getPublicKey(`${newKey.secretKey}`)
    //   }
    //   return newKey
    // })
    // .filter((newKey) => `${newKey.publicKey}` != 'undefined')
    // .forEach(newKey => {
    //   const newEncryptionKey: EncryptionKey = {...{publicKey: '', ...newKey}}
    //   props.putEncryptionKey(newEncryptionKey)
    // })
    group.setValue({
      publicKey:'',
      secretKey:'',
      label:''
    })
  };

//   function bytesToHex(byteArray: any[]) {
//     return Array.prototype.map.call(byteArray, function(byte) {
//       return ('0' + (byte & 0xFF).toString(16)).slice(-2);
//     }).join('');
//   }
//   function hexToBytes(hexString: string) {
//     var result = [];
//     for (var i = 0; i < hexString.length; i += 2) {
//       result.push(parseInt(hexString.substr(i, 2), 16));
//     }
//     return result;
//   }

  const handleClickNewEncryptionKey = () => {

    const keypair = chloride.crypto_box_keypair;
//   identityKeypair = await keypair();
//   keypairForm["secret-key"].value = identityKeypair.secretKey.toString('hex')
//   keypairForm["public-key"].value = identityKeypair.publicKey.toString('hex')
//   addReceiverForm['public-key'].value = identityKeypair.publicKey.toString('hex')
//   document.querySelector("#display-sender-encryption-secret-key").innerHTML = identityKeypair.secretKey.toString('hex')
//   document.querySelector("#display-sender-encryption-public-key").innerHTML =identityKeypair.publicKey.toString('hex')


    let encryptionSecretKey = 'generatePrivateKey'
    let encryptionPublicKey = 'generatepublickey'

    group.setValue({
      publicKey:`${encryptionPublicKey}`,
      secretKey:`${encryptionSecretKey}`,
      label:'label'
    })
  }

  const handleKeyClick = (publicKey: string) => {
    const valuesForSelectedKey = props.encryptionKeys
      .find(encryptionKeyEdit => encryptionKeyEdit['publicKey'] === publicKey)
    group.setValue(Object.assign({
        publicKey:'',
        secretKey:'',
        label:''
      }, valuesForSelectedKey))
  }

  const handleEraseClick = () => {
    group.setValue({
        publicKey:'',
        secretKey:'',
        label:''
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
    <PageHeader>Encryption Keys</PageHeader>
    <div>
      <form onSubmit={onSubmit}>
        <label for="publicKey">Public Key</label>
        <TextInput name="publicKey" control={group.controls.publicKey} />
        <label for="secretKey">Secret Key</label>
        <TextInput name="secretKey" control={group.controls.secretKey} />
        <div color='orange'>(Not secure - do not paste sensitive keys)</div>
        <label for="label">Label</label>
        <TextInput name="label" control={group.controls.label} />
        <div class='flex flex-row'>
          <div>
            <Button label={<VsAdd />} onClick={() => {
              handleClickNewEncryptionKey()
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
        <For each={props.encryptionKeys}>
          {(encryptionKey) => (
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
                  onClick={() => props.removeEncryptionKey(encryptionKey)}
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
                  onClick={() => handleKeyClick(encryptionKey.publicKey)}
                  label={encryptionKey.label || encryptionKey.publicKey}
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
export default EncryptionKeys;
export interface EncryptionKey {
  publicKey: string;
  secretKey?: string;
  label?: string;
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
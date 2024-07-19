import {
  createFilter,
  Combobox
} from "@kobalte/core";
import { PageHeader } from './components/PageHeader'
import {
  For,
  createSignal,
  Show
} from 'solid-js';
import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import { TextInput } from './components/TextInput'
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { Button } from './components/Button'
import { NostrKey } from './NostrKeys'
import { EncryptionKey } from './EncryptionKeys'
import {
  generatePrivateKey,
  getPublicKey,
  nip19
} from 'nostr-tools'

type Consortium = any

const Consortia = (props: {
    consortia: any;
    nostrKeys: NostrKey[];
    encryptionKeys: EncryptionKey[];
    // eslint-disable-next-line no-unused-vars
    putConsortium: (consortium?: Consortium) => void,
    // eslint-disable-next-line no-unused-vars
    removeConsortium: (consortium?: Consortium) => void
  }) => {
    console.log(props.consortia)
    // console.log(props.consortia)
    // const [trainLabelValues, setTrainLabelValues] = createSignal([]);
  const [signerNpub, setSignerNpub] = createSignal('');
  const filter = createFilter({ sensitivity: "base" });
  const [optionsEncryptionKeys, setOptionsEncryptionKeys] = createSignal<string[]>([]);
  const [optionsNpub, setOptionsNpub] = createSignal<string[]>([]);

//   const onOpenChange = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
//     // Show all options on ArrowDown/ArrowUp and button click.
//     if (isOpen && triggerMode === "manual") {
//       setOptions(props.trainLabels.map(trainLabel => trainLabel.id));
//     }
//   };
//   const onInputChange = (value: string) => {
//     setOptions(options()?.filter(option => filter.contains(option, value)));
//   };

  const onOpenChangeNpub = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptionsNpub(props.nostrKeys.map(nostrKey => nostrKey.publicKey))
      console.log(optionsNpub)
    }
  };
  const onInputChangeNpub = (value: string) => {
    setOptionsNpub(optionsNpub()?.filter(option => !filter.contains(option, value)));
  };

  const group = createFormGroup({
    id: createFormControl(''),
    label: createFormControl(''),
    signerNpub: createFormControl(''),
    memberPublicKeys: createFormControl([''])
  });

  const onSubmit = async (event?: Event ) => {
    const consortiumTemplate = {
      "id": 'marsjumproom',
      "label": "999Sepulveda",
      "signerNpub": "",
      "memberPublicKeys": [""]
    }
    try {
      event?.preventDefault()
    } catch (err) {
      //pass
    }
    if (group.isSubmitted) {
      console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        ...consortiumTemplate
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newConsortium => {
      const newConsortiumObj: Consortium = {
        ...consortiumTemplate,
        ...newConsortium
      }
      newConsortiumObj.signerNpub = signerNpub()
      if (newConsortiumObj.label === '') {
        return
      }
      console.log(newConsortiumObj)
      props.putConsortium(newConsortiumObj)
    })
    group.setValue(consortiumTemplate)
    setSignerNpub('')
    // setTrainLabelValues([]) 
  };

//   const handleToggleChecked = (id: string, newVal: boolean) => {
//     const valuesForSelectedFeed = props.consortia
//     .find(feedEdit => feedEdit['id'] === id)
//     const newValueObj = (Object.assign(
//       {
//         id: '',
//         npub: '',
//         trainLabels: []
//       },
//       {
//         ...valuesForSelectedFeed
//       },
//       {checked: newVal}
//     ))
//     group.setValue (newValueObj)
//     setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[])
//     setSignerNpub(valuesForSelectedFeed?.npub as string)
//     newValueObj.trainLabels = trainLabelValues()
//     newValueObj.npub = signerNpub()
//     if (newValueObj.id === '') {
//       return
//     }
//     const newClone = structuredClone(newValueObj)
//     props.putFeed(newClone)
//   }

  const handleClickConsortium = (label: string) => {
    // setTrainLabelValues([])
    setOptionsNpub([])
    setSignerNpub('')
    const valuesForSelectedConsortium = props.consortia
      .find((consortiumEdit: any) => consortiumEdit['label'] === label)
    group.setValue(Object.assign({
        id: '',
        label: '',
        signerNpub: '',
        memberPublicKeys: []
      }, valuesForSelectedConsortium))
    // setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[] || [''])
    setSignerNpub(valuesForSelectedConsortium?.signerNpub as string || '')
  }

  const handleClickCreateRoom = () => {
    console.log('you clicked create room')
    console.log(signerNpub())
  }

  return (
    <>
      <PageHeader>Consortia</PageHeader>
      <form onSubmit={onSubmit}>
        <label>Nostr Room Event ID
          <TextInput name="id" control={group.controls.id} />
        </label>
        <label>Label
          <TextInput name="label" control={group.controls.label} />
        </label>
        <Button
          onClick={() => handleClickCreateRoom()}
         label="new nostr room"
        />
      <Combobox.Root<string>
        multiple={false}
        options={props.nostrKeys.map(nostrKey => nostrKey.label || nostrKey.publicKey)}
        value={signerNpub()}
        onChange={setSignerNpub}
        onInputChange={onInputChangeNpub}
        onOpenChange={onOpenChangeNpub}
        placeholder="click label to remove..."
        itemComponent={props => (
          <Combobox.Item item={props.item} class='combobox__item w-200px'>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator class="combobox__item-indicator">
              <CheckIcon />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >
        <Combobox.Control<string> 
          aria-label="nPub"
          class="combobox__control" 
        >
        {state => (
          <> 
            <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
              &nbsp;signer npub&nbsp;
            </Combobox.Trigger>
            <div class='flex flex-row bg-white '>
              <For each={state.selectedOptions()}>
                {option => {
                  let nostrSecretKey = generatePrivateKey()
                  const npub = nip19.npubEncode(getPublicKey(nostrSecretKey))
                  return (<div class='align-bottom flex flex-row' onPointerDown={e => e.stopPropagation()}>
                    <Button
                      title={`remove ${option}`}
                      onClick={() => {
                        state.remove(option)
                      }}
                      label={option}
                      
                    />
                  </div>
                )}}
              </For>
            </div>
          </>
        )}
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="combobox__content">
          <Combobox.Listbox class="combobox__listbox font-sans"/>
        </Combobox.Content>
      </Combobox.Portal>
      </Combobox.Root>



      <div />

      <Combobox.Root<string[]>
        multiple={true}
        options={props.encryptionKeys.map((encryptionKey: {label?: string, publicKey: string}) => encryptionKey.label || encryptionKey.publicKey)}
        value={optionsEncryptionKeys()}
        onChange={setOptionsEncryptionKeys}
        onInputChange={onInputChangeNpub}
        onOpenChange={onOpenChangeNpub}
        placeholder="click label to remove..."
        itemComponent={props => (
          <Combobox.Item item={props.item} class='combobox__item w-200px'>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator class="combobox__item-indicator">
              <CheckIcon />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >
        <Combobox.Control<string> 
          aria-label="nPub"
          class="combobox__control" 
        >
        {state => (
          <> 
            <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
              &nbsp;member public keys&nbsp;
            </Combobox.Trigger>
            <div class='flex flex-row bg-white '>
              <For each={state.selectedOptions()}>
                {option => {
                  let nostrSecretKey = generatePrivateKey()
                  const npub = nip19.npubEncode(getPublicKey(nostrSecretKey))
                  return (<div class='align-bottom flex flex-row' onPointerDown={e => e.stopPropagation()}>
                    <Button
                      title={`remove ${option}`}
                      onClick={() => {
                        state.remove(option)
                      }}
                      label={option}
                      
                    />
                  </div>
                )}}
              </For>
            </div>
          </>
        )}
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="combobox__content">
          <Combobox.Listbox class="combobox__listbox font-sans"/>
        </Combobox.Content>
      </Combobox.Portal>
      </Combobox.Root>
      
      <Button
        title='submit'
        label='submit'
        onClick={() => {
          onSubmit()
        }}
        />
      </form>
      <strong style={{'font-size': 'large'}}>Consortia:</strong>
      <div class='h-50 overflow-y-auto'>
        <For each={props.consortia}>
            {(consortium) => (
              <Show when={`${consortium?.label}` != ''}>
                <div class='flex justify-between'>
                  {/* <div class='pt-2'>{consortium.trainLabels.join(', ').slice(0, 100)}</div> */}
                  <div class="flex justify-start">
                    <div class="flex justify-start">
                      <Button
                        class='text-base pt-0 mt-0'
                        onClick={() => handleClickConsortium(consortium?.label)}
                        label={consortium?.label}
                      />
                    </div>
                    <Button 
                      title={`remove ${consortium.label}`}
                      onClick={() => props.removeConsortium(consortium)}
                      label='✕'
                    />
                    {/* <Switch 
                      label=''
                      class="flex display-inline pt-2"
                      checked={feed.checked}
                      onChange={() => handleToggleChecked(`${feed.id}`, !feed.checked)}
                    /> */}
                  </div>
                </div>
              </Show>
            )}
        </For>
      </div>
    </>
  );
}

export default Consortia

//         <Combobox.Root<string>
//         multiple
//         options={props.trainLabels.map(trainLabel => trainLabel.id)}
//         value={trainLabelValues()}
//         onChange={setTrainLabelValues}
//         onInputChange={onInputChange}
//         onOpenChange={onOpenChange}
//         placeholder="click label to remove..."
//         itemComponent={props => (
//           <Combobox.Item item={props.item} class='combobox__item w-200px bg-inherit'>
//             <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
//             <Combobox.ItemIndicator class="combobox__item-indicator">
//               <CheckIcon />
//             </Combobox.ItemIndicator>
//           </Combobox.Item>
//         )}
//       >
//         <Combobox.Control<string> 
//           aria-label="Feeds"
//           class="bg-white combobox__control" 
//         >
//         {state => (
//           <> 
//             <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
//             &nbsp;+label&nbsp;
//             </Combobox.Trigger>
//             <div class='flex flex-row bg-white '>
//               <For each={state.selectedOptions()}>
//                 {option => (
//                   <div class='align-bottom flex flex-row' onPointerDown={e => e.stopPropagation()}>
//                     <Button
//                       title={`remove ${option}`}
//                       onClick={() => {
//                         state.remove(option)
//                       }}
//                       label={option}
//                     />
//                   </div>
//                 )}
//               </For>
//             </div>
//           </>
//         )}
//       </Combobox.Control>
//       <Combobox.Portal>
//         <Combobox.Content class="combobox__content">
//           <Combobox.Listbox class="combobox__listbox font-sans"/>
//         </Combobox.Content>
//       </Combobox.Portal>
//       </Combobox.Root>
import {
  createFilter,
  Combobox,
  Separator
} from "@kobalte/core";
import { Switch } from './components/Switch'
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

type JumpRoom = any

const JumpRooms = (props: {
    jumpRooms: any;
    nostrKeys: NostrKey[];
    // eslint-disable-next-line no-unused-vars
    putJumpRoom: (jumpRoom?: JumpRoom) => void,
    // eslint-disable-next-line no-unused-vars
    removeJumpRoom: (jumpRoom?: JumpRoom) => void
  }) => {
    console.log(props.nostrKeys)
    console.log(props.jumpRooms)
//   const [trainLabelValues, setTrainLabelValues] = createSignal([]);
  const [npubValue, setNpubValue] = createSignal('');
  const filter = createFilter({ sensitivity: "base" });
//   const [options, setOptions] = createSignal<string[]>();
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
    }
  };
  const onInputChangeNpub = (value: string) => {
    setOptionsNpub(optionsNpub()?.filter(option => !filter.contains(option, value)));
  };

  const group = createFormGroup({
    label: createFormControl(""),
    signerNpub: createFormControl("")
    // label:'',
    // npub:''
    // //,
    // // checked:true,
    // // trainLabels:['']
  });

  const onSubmit = async (event?: Event ) => {
    const emptyJumpRoom = {
      label: '',
      signerNpub: ''
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
        ...emptyJumpRoom
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newFeed => {
      const newJumpRoomObj: JumpRoom = {
        ...emptyJumpRoom,
        ...newFeed
      }
      // newJumpRoomObj.trainLabels = trainLabelValues()
      newJumpRoomObj.npub = npubValue()
      if (newJumpRoomObj.label === '') {
        return
      }
      console.log(newJumpRoomObj)
      props.putJumpRoom(newJumpRoomObj)
    })
    group.setValue(emptyJumpRoom)
    setNpubValue('')
    // setTrainLabelValues([]) 
  };

//   const handleToggleChecked = (id: string, newVal: boolean) => {
//     const valuesForSelectedFeed = props.jumpRooms
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
//     setNpubValue(valuesForSelectedFeed?.npub as string)
//     newValueObj.trainLabels = trainLabelValues()
//     newValueObj.npub = npubValue()
//     if (newValueObj.id === '') {
//       return
//     }
//     const newClone = structuredClone(newValueObj)
//     props.putFeed(newClone)
//   }

  const handleClickJumpRoom = (label: string) => {
    // setTrainLabelValues([])
    setOptionsNpub([])
    setNpubValue('')
    const valuesForSelectedJumpRoom = props.jumpRooms
      .find((jumpRoomEdit: any) => jumpRoomEdit['label'] === label)
    group.setValue(Object.assign({
        label: '',
        signerNpub: ''
      }, valuesForSelectedJumpRoom))
    // setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[] || [''])
    setNpubValue(valuesForSelectedJumpRoom?.signerNpub as string || '')
  }
  console.log(props.jumpRooms)
  return (
    <>
      <PageHeader>Jump Room</PageHeader>
      <form onSubmit={onSubmit}>
        <label>Label
          <TextInput name="label" control={group.controls.label} />
        </label>
      <Combobox.Root<string>
        multiple={false}
        options={optionsNpub()}
        value={npubValue()}
        onChange={setNpubValue}
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
          class="bg-white combobox__control" 
        >
        {state => (
          <> 
            <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
              &nbsp;+npub&nbsp;
            </Combobox.Trigger>
            <div class='flex flex-row bg-white '>
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
      <Button
        title='submit'
        label='submit'
        onClick={() => {
          onSubmit()
        }}
        />
      </form>

      <strong style={{'font-size': 'large'}}>Jump Rooms:</strong>
      <pre>{JSON.stringify(props.jumpRooms, null, 2)}</pre>
      <div class='h-50 overflow-y-auto'>
        <For each={props.jumpRooms}>
            {(jumpRoom) => (
              <Show when={`${jumpRoom?.label}` != ''}>
                <div class='flex justify-between'>
                  {/* <div class='pt-2'>{jumpRoom.trainLabels.join(', ').slice(0, 100)}</div> */}
                  <div class="flex justify-start">
                    <div class="flex justify-start">
                      <Button
                        class='text-base pt-0 mt-0'
                        onClick={() => handleClickJumpRoom(jumpRoom?.label)}
                        label={jumpRoom?.label}
                      />
                    </div>
                    <Button 
                      title={`remove ${jumpRoom.label}`}
                      onClick={() => props.removeJumpRoom(jumpRoom)}
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

export default JumpRooms

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

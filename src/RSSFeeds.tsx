import {
  createFilter,
  Button,
  Switch,
  Combobox,
  Collapsible,
  Separator
} from "@kobalte/core";
import {
  For,
  createSignal,
  Show
} from 'solid-js';
import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'
import { BiSolidSortAlt as CaretSortIcon } from 'solid-icons/bi'
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { ImCross as CrossIcon } from 'solid-icons/im'
import { VsAdd, VsTrash } from 'solid-icons/vs'
import { RSSFeed , TrainLabel} from './db-fixture'
const RSSFeeds = (props: {
    rssFeeds: RSSFeed[],
    trainLabels: TrainLabel[]
    // eslint-disable-next-line no-unused-vars
    putFeed: (feed: RSSFeed) => void,
    // eslint-disable-next-line no-unused-vars
    removeFeed: (feed: RSSFeed) => void
    handleFeedToggleChecked: any
  }) => {
  const [trainLabelValues, setTrainLabelValues] = createSignal([]);
  const filter = createFilter({ sensitivity: "base" });
  const [options, setOptions] = createSignal<string[]>();
  const onOpenChange = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptions(props.trainLabels.map(trainLabel => trainLabel.id));
    }
  };
  const onInputChange = (value: string) => {
    setOptions(options()?.filter(option => filter.contains(option, value)));
  };
  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true),
    trainLabels: createFormControl([])
  });

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (group.isSubmitted) {
      console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        checked:true,
        trainLabels:['']
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newFeed => {
      const newFeedObj: RSSFeed = {
        ...{
          id: '',
          checked: true,
          trainLabels: []
        },
        ...newFeed
      }
      newFeedObj.trainLabels = trainLabelValues()
      props.putFeed(newFeedObj)
    })
    group.setValue({
      id:'',
      checked:true,
      trainLabels: []
    })
    setTrainLabelValues([])
  };

  const handleToggleChecked = (id: string, newVal: boolean) => {
    const valuesForSelectedFeed = props.rssFeeds
    .find(feedEdit => feedEdit['id'] === id)
    const newValueObj = (Object.assign(
      {id: '', trainLabels: []},
      {
        ...valuesForSelectedFeed
      },
      {checked: newVal}
    ))
    group.setValue (newValueObj)
    setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[])
    newValueObj.trainLabels = [...trainLabelValues()]
    props.putFeed(newValueObj)
  }

  const handleKeyClick = (id: string) => {
    const valuesForSelectedFeed = props.rssFeeds
      .find(feedEdit => feedEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        checked:true,
        trainLabels:[]
      }, valuesForSelectedFeed))
    setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[])
  }

  return (
    <>
      <h1>{'Edit Feeds'}</h1>
      <Combobox.Root<string>
        multiple
        options={props.trainLabels.map(trainLabel => trainLabel.id)}
        value={trainLabelValues()}
        onChange={setTrainLabelValues}
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
        placeholder="click label to remove..."
        itemComponent={props => (
          <Combobox.Item item={props.item} class='combobox__item'>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator class="combobox__item-indicator">
              <CheckIcon />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >
      <form onSubmit={onSubmit}>
        <label for="id">Feed URL</label>
        <TextInput name="id" control={group.controls.id} />
      <Combobox.Control<string> 
        aria-label="Feeds"
        class="bg-white combobox__control border-none shadow-none bg-white" 
      >
        {state => (
          <>
            <Combobox.Trigger class='bg-transparent border-none align-middle text-2xl transition-all bg-transparent hover-text-white hover:bg-slate-400 rounded-full'>
              +
            </Combobox.Trigger>
            <div class='flex flex-row bg-white'>
              <Combobox.Input class="combobox__input border-none shadow-none bg-white"/>
              <For each={state.selectedOptions()}>
                {option => (
                  <div class='align-bottom flex flex-row' onPointerDown={e => e.stopPropagation()}>
                    <button
                      class='bg-transparent border-none m-0 align-top text-2xl text-gray'
                      onClick={(event) => {
                        state.remove(option)
                      }}
                    >
                      {option}
                    </button>
                  </div>
                )}
              </For>
            </div>
            <button
              onPointerDown={e => e.stopPropagation()} 
              onClick={state.clear}
              class='bg-transparent border-none align-middle text-3xl transition-all bg-transparent hover-text-white hover:bg-slate-400 rounded-full'
            >
            ✖
            </button>
          </>
        )}
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="combobox__content">
          <Combobox.Listbox class="combobox__listbox font-sans"/>
        </Combobox.Content>
      </Combobox.Portal>
      <div />
      <button
        onClick={(event) => {
          event.preventDefault()
          onSubmit(event)
        }}
        class='m-1 bg-transparent border-none align-middle text-4xl transition-all bg-transparent hover-text-white hover:bg-slate-400 rounded-full'
        >
        submit
      </button>
      </form>
      </Combobox.Root>
      <Separator.Root />
      <strong style={{'font-size': 'large'}}>feeds:</strong>
      <For each={props.rssFeeds}>
          {(feed) => (
            <Show when={feed.id != ''}>
              <Collapsible.Root class="collapsible" defaultOpen={true}>
                <Collapsible.Content class="collapsible__content">
                  <Collapsible.Trigger class="collapsible__trigger border-none bg-transparent">
                    <Button.Root class={'align-middle text-3xl transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full'} onClick={() => {setTimeout(() => props.removeFeed(feed), 300)}}>
                      <VsTrash/>
                    </Button.Root>
                    </Collapsible.Trigger>
                    &nbsp;
                    <Switch.Root
                      class="switch"
                      defaultChecked={feed.checked}
                      onChange={(newVal) => {
                        handleToggleChecked(`${feed.id}`, newVal)
                      }}
                    >
                      <Switch.Input class="switch__input" />
                      <Switch.Control class="switch__control">
                        <Switch.Thumb class="switch__thumb" />
                      </Switch.Control>
                    </Switch.Root>
                    
                    <Button.Root class={'text-2xl transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full'} onClick={() => handleKeyClick(feed.id)}>
                      {feed.id.replace('http[s?]://', '').slice(0, 25) || ''}
                    </Button.Root>
                    <span>{feed.trainLabels.join(', ')}</span>
                </Collapsible.Content>
              </Collapsible.Root>
            </Show>
          )}
      </For>
      
    </>
    
  );
}

export default RSSFeeds
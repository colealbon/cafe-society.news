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
        placeholder="Search some feeds…"
        itemComponent={props => (
          <Combobox.Item item={props.item}>
            <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
            <Combobox.ItemIndicator>
              <CheckIcon />
            </Combobox.ItemIndicator>
          </Combobox.Item>
        )}
      >

  <form onSubmit={onSubmit}>
    <label for="id">Feed URL</label>
    <TextInput name="id" control={group.controls.id} />
    <div>
      <Button.Root onClick={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}>
     <VsAdd />
    </Button.Root>
    <Button.Root onClick={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}>Submit</Button.Root>
    </div>
    </form>
        <Combobox.Control<string> aria-label="Feeds">
          {state => (
            <>
              <div>
                <For each={state.selectedOptions()}>
                  {option => (
                    <span onPointerDown={e => e.stopPropagation()}>
                      {option}
                      <button onClick={() => state.remove(option)}>
                        <div style={{'color': 'red'}}><CrossIcon /></div>
                      </button>
                    </span>
                  )}
                </For>
                <Combobox.Input />
              </div>
              <button onPointerDown={e => e.stopPropagation()} onClick={state.clear}>
              <div style={{'color': 'red'}}><CrossIcon /></div>
              </button>
              <Combobox.Trigger>
                <Combobox.Icon>
                  <CaretSortIcon />
                </Combobox.Icon>
              </Combobox.Trigger>
            </>
          )}
        </Combobox.Control>
        <Combobox.Portal>
          <Combobox.Content>
            <Combobox.Listbox style={{'background-color': 'white'}}/>
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>
      <p>feed trainLabels: {trainLabelValues().join(", ")}</p>
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
                      // onClick={() => {
                      //   props.handleFeedToggleChecked(feed.id)
                      // }}
                      onChange={(newVal) => {
                        handleToggleChecked(`${feed.id}`, newVal)
                      }}
                    >
                      <Switch.Input class="switch__input" />
                      <Switch.Control class="switch__control">
                        <Switch.Thumb class="switch__thumb" />
                      </Switch.Control>
                    </Switch.Root>
                    &nbsp;
                    <Button.Root class={'text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full'} onClick={() => handleKeyClick(feed.id)}>
                      {feed.id || ''}
                    </Button.Root>
                </Collapsible.Content>
              </Collapsible.Root>
            </Show>
          )}
        </For>
    </>
  );
}

export default RSSFeeds
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
import TextInput from './TextInput'
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { RSSFeed , TrainLabel} from './db-fixture'
import { Button } from './components/Button'
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
      <PageHeader>RSS Feeds</PageHeader>
      <Combobox.Root<string>
        multiple
        options={props.trainLabels.map(trainLabel => trainLabel.id)}
        value={trainLabelValues()}
        onChange={setTrainLabelValues}
        onInputChange={onInputChange}
        onOpenChange={onOpenChange}
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
      <form onSubmit={onSubmit}>
        <label for="id">Feed URL</label>
        <TextInput name="id" control={group.controls.id} />
        <Combobox.Control<string> 
          aria-label="Feeds"
          class="bg-white combobox__control bg-white" 
        >
        {state => (
          <> 
            <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
              &nbsp;+&nbsp;
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
      <div />
      <Button
        title='submit'
        label='submit'
        onClick={() => {
          onSubmit(Event)
        }}/>
      </form>
      </Combobox.Root>
      <Separator.Root />
      <strong style={{'font-size': 'large'}}>feeds:</strong>
      <For each={props.rssFeeds}>
          {(feed) => (
            <Show when={feed.id != ''}>
              <div class='flex justify-between'>
                <div class='pt-2'>{feed.trainLabels.join(', ').slice(0, 100)}</div>
                <div class="flex justify-start">
                  <div class="flex justify-start">
                    <Button
                      class='text-base pt-0 mt-0'
                      onClick={() => handleKeyClick(feed.id)}
                      label={feed.id.replace('http[s?]://', '').slice(0, 25) || ''}
                    />
                  </div>
                  <Button 
                    title={`remove ${feed.id}`}
                    onClick={() => {setTimeout(() => props.removeFeed(feed), 300)}}
                    label='✕'
                  />
                  <Switch 
                    label=''
                    class="flex display-inline pt-2"
                    checked={feed.checked}
                    onChange={() => handleToggleChecked(`${feed.id}`, !feed.checked)}
                  />
                </div>
              </div>
            </Show>
          )}
      </For>
    </>
  );
}

export default RSSFeeds
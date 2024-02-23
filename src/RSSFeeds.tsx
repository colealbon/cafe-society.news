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
import { NostrKey } from './NostrKeys'
import * as nip19 from 'nostr-tools/nip19'

const RSSFeeds = (props: {
    rssFeeds: RSSFeed[],
    trainLabels: TrainLabel[],
    nPubOptions: NostrKey[],
    // eslint-disable-next-line no-unused-vars
    putFeed: (feed: RSSFeed) => void,
    // eslint-disable-next-line no-unused-vars
    removeFeed: (feed: RSSFeed) => void
    handleFeedToggleChecked: any
  }) => {
  const [trainLabelValues, setTrainLabelValues] = createSignal([]);
  const [npubValue, setNpubValue] = createSignal('');
  const filter = createFilter({ sensitivity: "base" });
  const [options, setOptions] = createSignal<string[]>();
  const [optionsNpub, setOptionsNpub] = createSignal<string[]>();

  const onOpenChange = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptions(props.trainLabels.map(trainLabel => trainLabel.id));
    }
  };
  const onInputChange = (value: string) => {
    setOptions(options()?.filter(option => filter.contains(option, value)));
  };

  const onOpenChangeNpub = (isOpen: boolean, triggerMode?: Combobox.ComboboxTriggerMode) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    if (isOpen && triggerMode === "manual") {
      setOptionsNpub(props.nPubOptions.map(nPubOption => nPubOption.publicKey))
    }
  };
  const onInputChangeNpub = (value: string) => {
    setOptionsNpub(optionsNpub()?.filter(option => !filter.contains(option, value)));
  };

  const group = createFormGroup({
    id: createFormControl(""),
    npub: createFormControl(""),
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
        npub:'',
        checked:true,
        trainLabels:['']
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newFeed => {
      const newFeedObj: RSSFeed = {
        ...{
          id: '',
          npub: '',
          checked: true,
          trainLabels: []
        },
        ...newFeed
      }
      newFeedObj.trainLabels = trainLabelValues()
      newFeedObj.npub = npubValue()
      if (newFeedObj.id === '') {
        return
      }
      props.putFeed(newFeedObj)
    })
    group.setValue({
      id:'',
      npub:'',
      checked:true,
      trainLabels: []
    })
    setNpubValue('')
    setTrainLabelValues([]) 
  };

  const handleToggleChecked = (id: string, newVal: boolean) => {
    const valuesForSelectedFeed = props.rssFeeds
    .find(feedEdit => feedEdit['id'] === id)
    const newValueObj = (Object.assign(
      {
        id: '',
        npub: '',
        trainLabels: []
      },
      {
        ...valuesForSelectedFeed
      },
      {checked: newVal}
    ))
    group.setValue (newValueObj)
    setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[])
    setNpubValue(valuesForSelectedFeed?.npub as string)
    newValueObj.trainLabels = trainLabelValues()
    newValueObj.npub = npubValue()
    if (newValueObj.id === '') {
      return
    }
    const newClone = structuredClone(newValueObj)
    props.putFeed(newClone)
  }

  const handleClickFeed = (id: string) => {
    setTrainLabelValues([])
    setOptionsNpub([])
    setNpubValue('')
    const valuesForSelectedFeed = props.rssFeeds
      .find(feedEdit => feedEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        npub: '',
        checked:true,
        trainLabels:[]
      }, valuesForSelectedFeed))
    setTrainLabelValues(valuesForSelectedFeed?.trainLabels as string[] || [''])
    setNpubValue(valuesForSelectedFeed?.npub as string || '')
  }

  return (
    <>
      <PageHeader>RSS Feeds</PageHeader>
      <form onSubmit={onSubmit}>
        <label for="id">Feed URL</label>
        <TextInput name="id" control={group.controls.id} />
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
        <Combobox.Control<string> 
          aria-label="Feeds"
          class="bg-white combobox__control" 
        >
        {state => (
          <> 
            <Combobox.Trigger class='border-none bg-transparent align-middle text-3xl transition-all hover-text-white hover:bg-black rounded-full'>
            &nbsp;+label&nbsp;
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

      
      <Combobox.Root<string>
        multiple={false}
        options={props.nPubOptions.map((nostrKey => nostrKey.publicKey ? nip19.npubEncode(nostrKey.publicKey): ''))}
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
          onSubmit(Event)
        }}/>
      </form>
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
                      onClick={() => handleClickFeed(feed.id)}
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
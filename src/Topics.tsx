import {
  createFilter,
  Separator
} from "@kobalte/core"

import {
  Combobox
} from './components/Combobox'

import { Switch } from './components/Switch'
import { PageHeader } from './components/PageHeader'
import {
  For,
  createSignal,
  Show
} from 'solid-js'
import {
  createFormGroup,
  createFormControl,
} from "solid-forms"
import { TextInput } from './components/TextInput'
import { FaSolidCheck  as CheckIcon} from 'solid-icons/fa'
import { Topic } from './db-fixture'
import { Button } from './components/Button'
import { NostrKey } from './NostrKeys'
import * as nip19 from 'nostr-tools/nip19'

const Topics = (props: {
    topics: Topic[],
    nostrKeys: NostrKey[],
    // eslint-disable-next-line no-unused-vars
    putTopic: (topic: Topic) => void,
    // eslint-disable-next-line no-unused-vars
    removeTopic: (topic: Topic) => void
    handleTopicToggleChecked: any
  }) => {
  const [subscribers, setSubscribers] = createSignal<string[]>([])
  const [labelText, setLabelText] = createSignal('')
  const filter = createFilter({ sensitivity: "base" })
  const [options, setOptions] = createSignal<NostrKey[]>()
  const [optionsNpub, setOptionsNpub] = createSignal<string[]>([])
  const onOpenChange = (isOpen: boolean, triggerMode: any) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    //if (isOpen && triggerMode === "manual") {
      setOptionsNpub(props.nostrKeys.map(nostrKey => nip19.npubEncode(nostrKey.publicKey)))
    //}
  }

  // const onOpenChange = (isOpen: boolean, triggerMode?: any) => {
  //   // Show all options on ArrowDown/ArrowUp and button click.
  //   if (isOpen && triggerMode === "manual") {
  //     setOptions(props.nostrKeys)
  //   }
  // }
  const onInputChange = (value: string) => {
    setOptions(options()?.filter(option => filter.contains(option.publicKey, value)))
  }

  const onOpenChangeNpub = (isOpen: boolean, triggerMode?: any) => {
    // Show all options on ArrowDown/ArrowUp and button click.
    //if (isOpen && triggerMode === "manual") {
      setOptionsNpub(props.nostrKeys.map(nPubOption => nPubOption.publicKey))
    //}
  }
  const onInputChangeNpub = (value: string) => {
    setOptionsNpub(optionsNpub()?.filter(option => !filter.contains(option, value)))
  }

  const group = createFormGroup({
    id: createFormControl(""),
    label: createFormControl(""),
    checked: createFormControl(true),
    subscribers: createFormControl([])
  })

  const onSubmit = async (event: Event) => {
    try {
      event.preventDefault()
    } catch (err) {
      //pass
    }
    if (group.isSubmitted) {
      console.log('already submitted')
      return
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        npub:'',
        checked:true,
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newTopic => {
      const newTopicObj: Topic = {
        ...{
          id: '',
          label: '',
          checked: true,
          subscribers: ['']
        },
        ...newTopic
      }
      newTopicObj.subscribers = subscribers()
      newTopicObj.label = labelText()
      if (newTopicObj.id === '') {
        return
      }
      props.putTopic(newTopicObj)
    })
    group.setValue({
      id:'',
      label:'',
      checked:true,
      subscribers: []
    })
    setLabelText('')
    setSubscribers(['']) 
  }

  const handleToggleChecked = (id: string, newVal: boolean) => {
    const valuesForSelectedTopic = props.topics.slice()
    .find(topicEdit => topicEdit['id'] === id)
    const newValueObj = (Object.assign(
      {
        id: '',
        label: '',
        subscribers: []
      },
      {
        ...valuesForSelectedTopic
      },
      {checked: newVal}
    ))
    group.setValue(newValueObj)

    // const subscriberPubKeys: string[] = valuesForSelectedTopic?.subscribers as string[] || ['1','2','3'] as string[]
    // setSubscribers([])
    // setLabelText(valuesForSelectedTopic?.label as string)
    // newValueObj.subscribers = subscriberPubKeys as string[]
    // newValueObj.label = labelText()
    // if (newValueObj.id === '') {
    //   return
    // }
    const newClone = structuredClone(newValueObj)
    props.putTopic(newClone)
  }

  const handleClickTopic = (id: string) => {
    setSubscribers([])
    setOptionsNpub([])
    setLabelText('')
    const valuesForSelectedTopic = props.topics
      .find(topicEdit => topicEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        label: '',
        checked:true,
        subscribers:[]
      }, valuesForSelectedTopic))
    const newSubscribers = valuesForSelectedTopic?.subscribers.slice() || []
    setSubscribers(newSubscribers)
    setLabelText(valuesForSelectedTopic?.label as string || '')
  }

  return (
    <>
      <PageHeader>Topics</PageHeader>
      <form onSubmit={onSubmit}>
        <label>Topic Label
        <TextInput name="topicLabelInput" control={group.controls.id} />
        </label>
        <Combobox
          multiple
          ariaLabel='subscribers'
          options={props.nostrKeys.map(nostrKey => nip19.npubEncode(nostrKey.publicKey))}
          onChange={setSubscribers}
          onInputChange={onInputChangeNpub}
          placeholder="enter subscribers"
        />
      <div />
      <Button
        title='submit'
        label='submit'
        onClick={() => {
          onSubmit
        }}/>
      </form>
      <Separator.Root />
      <strong style={{'font-size': 'large'}}>topics:</strong>
      <For each={props.topics}>
          {(topic) => (
            <Show when={topic.id != ''}>
              <div class='flex justify-between'>
                <div class='pt-2'>{topic.subscribers.join(', ').slice(0, 100)}</div>
                <div class="flex justify-start">
                  <div class="flex justify-start">
                    <Button
                      class='text-base pt-0 mt-0'
                      onClick={() => handleClickTopic(topic.id)}
                      label={topic.id || ''}
                    />
                  </div>
                  <Button 
                    title={`remove ${topic.id}`}
                    onClick={() => {setTimeout(() => props.removeTopic(topic), 300)}}
                    label='✕'
                  />
                  <Switch 
                    label=''
                    class="flex display-inline pt-2"
                    checked={topic.checked}
                    onChange={() => handleToggleChecked(`${topic.id}`, !topic.checked)}
                  />
                </div>
              </div>
            </Show>
          )}
      </For>
    </>
  )
}

export default Topics
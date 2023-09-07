import {
  For
} from 'solid-js';

import {
  Link,
  Switch,
  Separator
} from "@kobalte/core";

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'

import {
  VsAdd
} from 'solid-icons/vs'
import { TrainLabel } from './db-fixture'
const TrainLabels = (props: {
  trainLabels: TrainLabel[],
  // eslint-disable-next-line no-unused-vars
  putTrainLabel: (trainLabel: TrainLabel) => void,
  // eslint-disable-next-line no-unused-vars
  removeTrainLabel: (trainLabel: TrainLabel) => void
}) => {

  const group = createFormGroup({
    id: createFormControl(""),
    checked: createFormControl(true)
  });

  const onSubmit = async (event: any) => {
    event.preventDefault()
    if (group.isSubmitted) {
      // console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        checked:true
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newTrainLabel => {
      const newTrainLabelObj: TrainLabel = {
        ...{
          id: '',
          checked: true
        },
        ...newTrainLabel
      }
      props.putTrainLabel(newTrainLabelObj)
    })

    group.setValue({
      id:'',
      checked:true
    })
  };

  const handleKeyClick = (id: string) => {
    const valuesForSelectedTrainLabel = props.trainLabels
      .find(categoryEdit => categoryEdit['id'] === id)
    group.setValue(Object.assign({
        id:'',
        checked:true
      }, valuesForSelectedTrainLabel))
  }

  const handleToggleChecked = (id: string) => {
    const valuesForSelectedTrainLabel = props.trainLabels
    .find(labelEdit => labelEdit['id'] === id)

    if (valuesForSelectedTrainLabel?.id == undefined) {
      return
    }

    const newValueObj = {
        ...valuesForSelectedTrainLabel
      ,
      checked: !valuesForSelectedTrainLabel.checked
    }

    props.putTrainLabel(newValueObj)
  }

  return (
  <div class='fade-in transition-duration-.3s'>
    <h1>Edit Train Labels</h1>
    <Separator.Root />
    <form onSubmit={onSubmit}>
      <label for="id">train label</label>
      <TextInput
        name='id'
        control={group.controls.id}
      />
      <button
        class={`mt-2 transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full`}
        onClick={(event) => {
        event.preventDefault()
        onSubmit(event)
      }}>
        <VsAdd class='align-middle text-xl mt-1 mb-1'/>
      </button>
    </form>
  <For each={props.trainLabels}>
    {(trainLabel) => (
      <div class='flex flex-row'>
        <button
          class={`mr-1 transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full`}
          onClick={() => props.removeTrainLabel(trainLabel)}
        >
          <div class='m-1 mt-1 align-middle text-xl'>✕</div>
        </button>
        <Switch.Root
          class="switch"
          defaultChecked={trainLabel.checked}
          onChange={(newVal) => {
            handleToggleChecked(`${trainLabel.id}`)
          }}
        >
          <Switch.Input class="switch__input" />
          <Switch.Control class="switch__control">
            <Switch.Thumb class="switch__thumb" />
          </Switch.Control>
        </Switch.Root>
        <button
          class={`text-xl ml-1 mt-2 mb-2 transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full`}
          onClick={() => handleKeyClick(trainLabel.id)}
        >
          {trainLabel.id || ''}
        </button>
      </div>
    )}
  </For>
  </div>
  )
}
export default TrainLabels;

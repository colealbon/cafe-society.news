import {
  For
} from 'solid-js';

import { Switch } from './components/Switch'
import { PageHeader } from './components/PageHeader'
import { Button } from './components/Button'
import { TextInput } from './components/TextInput'

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";

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
    <PageHeader>Edit Train Labels</PageHeader>

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
    <div class='h-50 overflow-y-auto'>
  <For each={props.trainLabels}>
    {(trainLabel) => (
      <div class='flex flex-row'>
        <Switch 
          class="flex display-inline pt-2 p-0"
          label=''
          onChange={() => handleToggleChecked(`${trainLabel.id}`)}
          checked={trainLabel.checked}
        />
        <Button
          onClick={() => props.removeTrainLabel(trainLabel)}
          label='✕'
        />
        <Button
          onClick={() => handleKeyClick(trainLabel.id)}
          label={trainLabel.id || ''}
        />
      </div>
    )}
  </For>
  </div>
  </div>
  )
}
export default TrainLabels;

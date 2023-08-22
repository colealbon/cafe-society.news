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
  VsAdd,
  VsTrash
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
      checked: !group.value.checked
    }

    group.setValue(newValueObj)
    props.putTrainLabel(newValueObj)
  }

  return (
  <div class='fade-in transition-duration-.3s'>
    <h1>Edit Train Labels</h1>
    <Separator.Root />
    <form onSubmit={onSubmit}>
      <label for="id">train label</label>
      <TextInput name="id" control={group.controls.id} />
      <div />
      <Switch.Root
        checked={group.value.checked}
        name="checked"
        onChange={handleToggleChecked(`${group.value.id}`)}
      />
      <div>
        <Link.Root onClick={(event) => {
          event.preventDefault()
          onSubmit(event)
        }}>
          <VsAdd />
        </Link.Root>
      </div>
    </form>
  <h4 class="text-muted">TrainLabels</h4>
  <For each={props.trainLabels}>
    {(trainLabel) => (
      <div>
        <div>
          <Link.Root onClick={(event) => {
              event.preventDefault()
              props.removeTrainLabel(trainLabel)
            }}>
              <VsTrash />
          </Link.Root>
        </div>
        <Switch.Root
          class="switch"
          defaultChecked={trainLabel.checked}
          onClick={() => handleToggleChecked(trainLabel.id)}
        />
        <div style={
        {
          'padding': '8px 8px 8px 32px',
          'text-decoration': 'none',
          'font-size': '25px',
          'color': '#818181',
          'display': 'block',
          'transition':'0.3s'
        }}>
        <Link.Root onClick={(event) => {
          event.preventDefault()
          handleKeyClick(trainLabel.id)
        }}>
          {trainLabel.id || ''}
        </Link.Root>
      </div>
      </div>
    )}
  </For>
  </div>
  )
}
export default TrainLabels;

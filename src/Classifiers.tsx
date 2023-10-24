import {
  For
} from 'solid-js';
import { Collapsible } from "@kobalte/core";

import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'

import {
  VsAdd,
  VsCopy
} from 'solid-icons/vs'
import { Classifier } from './db-fixture'
import { PageHeader } from './components/PageHeader'
import { Button } from './components/Button'

const Classifiers = (props: {
  classifiers: Classifier[],
  // eslint-disable-next-line no-unused-vars
  putClassifier: (classifier: Classifier) => void,
  // eslint-disable-next-line no-unused-vars
  removeClassifier: (classifier: Classifier) => void
}) => {

  const group = createFormGroup({
    id: createFormControl(""),
    model: createFormControl(""),
    thresholdSuppressOdds: createFormControl('')
  });

  const onSubmit = async (event) => {
    event.preventDefault()
    if (group.isSubmitted) {
      // console.log('already submitted')
      return;
    }
    [Object.fromEntries(
      Object.entries(Object.assign({
        id:'',
        model:'',
        thresholdSuppressOdds: ''
      }, group.value))
      .filter(([, value]) => `${value}` !== '')
    )]
    .forEach(newClassifier => {
      const newClassifierObj: Classifier = {
        ...{
          id: '',
          model: '',
          thresholdSuppressOdds: ''
        },
        ...newClassifier
      }
      props.putClassifier(newClassifierObj)
    })

    group.setValue({
      id:'',
      model:'',
      thresholdSuppressOdds: ''
    })
  };

  const handleAddClick = (event) => {
    event.preventDefault()
    onSubmit(event)
    group.setValue({
      id:'',
      model: '',
      thresholdSuppressOdds: ''
    })
  }

  const handleKeyClick = (id: string) => {
    const valuesForSelectedClassifier = props.classifiers
      .find(classifierEdit => classifierEdit['id'] === id)
    const newClassifier: any = {
      id: `${valuesForSelectedClassifier?.id}`,
      model: `${valuesForSelectedClassifier?.model}`,
      thresholdSuppressOdds: `${valuesForSelectedClassifier?.thresholdSuppressOdds}`
    }
    group.setValue(newClassifier)
  }

  const handleCopyClick = () => {
    navigator.clipboard.writeText(group.controls.model.rawValue);
  }

  const handleRemoveClick = (classifier: any) => {
    props.removeClassifier(classifier)
  }

  return (
  <div class='fade-in'>
    <PageHeader>Edit Classifiers</PageHeader>
    <form onSubmit={onSubmit}>
      <label for="id">label</label>
      <TextInput name="id" control={group.controls.id} />
      <div />
      <label for="thresholdSuppressOdds">Threshold Suppress Odds</label>
      <TextInput name="thresholdSuppressOdds" control={group.controls.thresholdSuppressOdds} />
      <div />
      <label for="Model">Bayes Model</label>
      <TextInput name="model" control={group.controls.model} />
      <Button
        onClick={() => handleAddClick}
        label={<VsAdd />}
      />
    </form>
    <Collapsible.Root class="collapsible border-none bg-transparent" defaultOpen={false}>
    <Collapsible.Trigger class="collapsible__trigger hover-bg-slate-900 hover-text-white bg-transparent border-none">
      <div class='hover-bg-slate-900 hover-text-white bg-transparent border-none'>JSON</div>
    </Collapsible.Trigger>
    <Collapsible.Content class="collapsible__content">
      <p class="collapsible__content-text">
      {<>
        <Button
          onClick={handleCopyClick}
          label={<VsCopy />}
        />
      <div style={{'max-width': '500px'}}>
        <pre>{JSON.stringify(group.controls.model.rawValue, null, 2)}</pre>
      </div>
    </>}
    </p>
    </Collapsible.Content>
    </Collapsible.Root>
  <div>
  <h4 class="text-muted">Classifiers</h4>
  <For each={props.classifiers}>
    {(classifier) => (
      <div style={{
        'width': '100%',
        'display': 'flex',
        'flex-direction': 'row',
        'justify-content': 'flex-start',
        'font-size': '25px',
      }}>
        <div style={
          {
            'padding': '8px 8px 8px 32px',
            'text-decoration': 'none',
            'font-size': '25px',
            'color': '#818181',
            'display': 'block',
            'transition':'0.3s'
          }}>
        <Button 
          onClick={() => handleRemoveClick(classifier)}
          label='✕'
        />
        </div>
        <div style={
        {
          'padding': '8px 8px 8px 32px',
          'text-decoration': 'none',
          'font-size': '25px',
          'color': '#818181',
          'display': 'block',
          'transition':'0.3s'
        }}>
          <Button
            onClick={() => handleKeyClick(classifier.id)}
            label={classifier.id || ''}
          />
        </div>
      </div>
    )}
  </For>
  </div>
  </div>
  )
}
export default Classifiers;

import {
  Show,
  For,
  mergeProps,
  type Component } from "solid-js";
import {
  IFormControl,
  createFormControl
} from "solid-forms";

export const DEFAULT_CLASS=""            

export const TextInput: Component<{
  control?: IFormControl<string>;
  name?: string;
  type?: string;
  testid?: string;
}> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
      testid: 'textinput',
      control: createFormControl("")
    }, props);
  // here we provide a default form control in case the user doesn't supply one
  // props = mergeProps({ control: createFormControl(""), type: "text" }, props);

  return (
    <div
      classList={{
        "is-invalid": !!props.control?.errors,
        "is-touched": props.control?.isTouched,
        "is-required": props.control?.isRequired,
        "is-disabled": props.control?.isDisabled,
      }}
    >
      <input
        class="p-5 w-9/10"
        name={props.name}
        type={props.type}
        value={props.control?.value}
        onInput={(e) => {
          props.control?.setValue(e.currentTarget.value);
        }}
        onBlur={() => props.control?.markTouched(true)}
        required={props.control?.isRequired}
        disabled={props.control?.isDisabled}
        data-testid={props.testid}
      />
      <Show when={props.control?.isTouched && !props.control.isValid}>
        <For each={Object.values({...props.control?.errors})}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
};
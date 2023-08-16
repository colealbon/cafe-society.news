import type { Component} from 'solid-js'
import { createSignal } from 'solid-js';
import { Button, Tabs } from "@kobalte/core";

function createStoredSignal<T>(
  key: string,
  defaultValue: T,
  storage = localStorage
): Signal<T> {
  const initialValue = storage.getItem(key) != undefined
    ? JSON.parse(`${storage.getItem(key)}`) as T
    : defaultValue;
  const [value, setValue] = createSignal<T>(initialValue);
  const setValueAndStore = ((arg) => {
    const v = setValue(arg);
    storage.setItem(key, JSON.stringify(v));
    return v;
  }) as typeof setValue;
  return [value, setValueAndStore];
}

const App: Component = () => {
  const navBarWidth = '1/3'
  const navButtonStyle=`m-1 w-${navBarWidth} bg-transparent border-none transition-all bg-transparent border-none hover-text-white hover:bg-slate-300 rounded`

  const [navIsOpen, setNavIsOpen] = createStoredSignal('isNavOpen', false);
  return (
    <div>
      <div class={navIsOpen() ? 'hidden' : ''}>
        <Button.Root
          class={`transition-all bg-transparent border-none hover-text-white hover:bg-slate-300 rounded-full`}
          onClick={event => {
            event.preventDefault()
            setNavIsOpen(true)
          }}
        >⭢
        </Button.Root>
      </div>
      <div class={navIsOpen() ? '' : 'hidden'}>
        <Button.Root
          class={`transition-all bg-transparent border-none hover-text-white hover:bg-slate-300 rounded-full`}
          onClick={event => {
            event.preventDefault()
            setNavIsOpen(false)
          }}
        >
          ⭠
        </Button.Root>
      </div>
      <Tabs.Root orientation='vertical'>
      <div class='flex flex-row'>
        <div class={navIsOpen() ? '' : 'hidden'}>
          <div>
            <Tabs.List>
              <div>
                <Tabs.Trigger class={navButtonStyle} value="profile">Profile</Tabs.Trigger>
              </div>
              <div>
                <Tabs.Trigger class={navButtonStyle} value="dashboard">Dashboard</Tabs.Trigger>
              </div>
              <div>
                <Tabs.Trigger class={navButtonStyle} value="settings">Settings</Tabs.Trigger>
              </div>
              <div>
                <Tabs.Trigger class={navButtonStyle} value="contact">Contact</Tabs.Trigger>
              </div>
            </Tabs.List>
          </div>
        </div>
        <div class='w-full transition-all'>
          <div class='flex items-center justify-center m-5'>
            <Tabs.Content value="profile">Profile details</Tabs.Content>
            <Tabs.Content value="dashboard">Dashboard details</Tabs.Content>
            <Tabs.Content value="settings">Settings details</Tabs.Content>
            <Tabs.Content value="contact">Contact details</Tabs.Content>
          </div>
        </div>
        </div>
      </Tabs.Root>
    </div>
  )
};

export default App;
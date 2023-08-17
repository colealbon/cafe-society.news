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
  const navButtonStyle=`text-xl text-white border-none transition-all bg-transparent hover-text-white hover:bg-slate-600 rounded`
  const [navIsOpen, setNavIsOpen] = createStoredSignal('isNavOpen', false);
  return (
    <div>
      <div class={navIsOpen() ? 'm-1 hidden' : 'm-1 animate-fade-in-right animate-duration-.3s '}>
        <Button.Root
          class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-slate-600 rounded-full`}
          onClick={event => {
            event.preventDefault()
            setNavIsOpen(true)
          }}
        >⭢
        </Button.Root>
      </div>
      <Tabs.Root>
        <div class='m-1 flex flex-column'>
          <div class={navIsOpen() ? `animate-fade-in-left animate-duration-.3s` : 'hidden'}>
            <div class={`bg-black w-full h-9/10 rounded-2 mr-3`}>
              <div class={navIsOpen() ? '' : 'animate-fade-out-left animate-duration-.3s'}>
                <Button.Root
                  class={`text-4xl text-white transition-all bg-transparent border-none hover-text-white hover:bg-slate-600 rounded-full`}
                  onClick={event => {
                    event.preventDefault()
                    setNavIsOpen(false)
                  }}
                >
                  ⭠
                </Button.Root>
              </div>
              <Tabs.List>
                <div><Tabs.Trigger class={navButtonStyle} value="profile">Profile</Tabs.Trigger></div>
                <div><Tabs.Trigger class={navButtonStyle} value="dashboard">Dashboard</Tabs.Trigger></div>
                <div><Tabs.Trigger class={navButtonStyle} value="settings">Settings</Tabs.Trigger></div>
                <div><Tabs.Trigger class={navButtonStyle} value="contact">Contact</Tabs.Trigger></div>
              </Tabs.List>
            </div>
          </div>
          <div class='w-full h-screen'>
            <div class='flex justify-center m-5 h-9/10'>
              <Tabs.Content class='animate-fade-in' value="profile">Profile details</Tabs.Content>
              <Tabs.Content class='animate-fade-in' value="dashboard">Dashboard details</Tabs.Content>
              <Tabs.Content class='animate-fade-in' value="settings">Settings details</Tabs.Content>
              <Tabs.Content class='animate-fade-in' value="contact">Contact details</Tabs.Content>
            </div>
          </div>
        </div>
      </Tabs.Root>
    </div>
  )
};

export default App;
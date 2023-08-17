import type { Component} from 'solid-js'
import { createSignal } from 'solid-js';
import { Button, Tabs } from "@kobalte/core";
import Contact from './Contact'
import Profile from './Profile'

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
  const navButtonStyle=`text-xl text-white border-none transition-all bg-transparent`
  const [navIsOpen, setNavIsOpen] = createStoredSignal('isNavOpen', false);
  const [albyCodeVerifier, setAlbyCodeVerifier] = createStoredSignal('albyCodeVerifier', '')
  const [albyCode, setAlbyCode] = createStoredSignal('albyCode', '')
  const [albyTokenReadInvoice, setAlbyTokenReadInvoice] = createStoredSignal('albyTokenReadInvoice', '')
  return (
    <div>
      <div class={navIsOpen() ? 'm-1 hidden' : 'm-1 animate-fade-in animate-duration-1s'}>
        <Button.Root
          class={`ml-1 text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
          onClick={event => {
            event.preventDefault()
            setNavIsOpen(true)
          }}
        >⭢
        </Button.Root>
      </div>
      <Tabs.Root>
        <div class='m-1 flex flex-column'>
          <div class={navIsOpen() ? `animate-fade-in-left animate-duration-.3s` : 'w-0'}>
            <div class={`bg-red-900 w-full h-9/10 rounded-2 mr-3`}>
              <div class={navIsOpen() ? '' : 'animate-fade-out-left animate-duration-.3s'}>
                <Button.Root
                  class={`text-4xl text-white bg-transparent border-none hover-text-white hover:bg-slate-900 rounded-full`}
                  onClick={event => {
                    event.preventDefault()
                    setNavIsOpen(false)
                  }}
                >
                  ⭠
                </Button.Root>
              </div>
              <Tabs.List>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} value="profile">Profile</Tabs.Trigger><div /></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} value="dashboard">Dashboard</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} value="settings">Settings</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} value="contact">Contact</Tabs.Trigger></div>
              </Tabs.List>
            </div>
          </div>
          <div class='w-full h-screen font-sans fade-in'>
            <div class='flex flex-col m-5 h-9/10'>
              <Tabs.Content class='animate-fade-in animate-duration-.1s' value="profile">
                <Profile
                  albyCodeVerifier={albyCodeVerifier}
                  setAlbyCodeVerifier={setAlbyCodeVerifier}
                  albyCode={albyCode}
                  setAlbyCode={setAlbyCode}
                  albyTokenReadInvoice={albyTokenReadInvoice}
                  setAlbyTokenReadInvoice={setAlbyTokenReadInvoice}
                />
              </Tabs.Content>
              <Tabs.Content class='animate-fade-in animate-duration-.5s' value="dashboard">Dashboard details</Tabs.Content>
              <Tabs.Content class='animate-fade-in-right animate-duration-.5s' value="settings">Settings details</Tabs.Content>
              <Tabs.Content class='animate-fade-in animate-duration-.5s' value="contact"><Contact/></Tabs.Content>
            </div>
          </div>
        </div>
      </Tabs.Root>
    </div>
  )
};
export default App;
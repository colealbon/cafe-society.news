import type { Component} from 'solid-js'
import { createSignal } from 'solid-js';
import { Button, Tabs } from "@kobalte/core";
import { createDexieArrayQuery } from "solid-dexie";

import Contact from './Contact'
import CorsProxies from './CorsProxies'
import defaultCorsProxies from './defaultCorsProxies';
import Profile from './Profile'
import {
  DbFixture,
  NostrRelay,
  NostrKey,
  TrainLabel,
  Feed,
  CorsProxy,
  Classifier,
  ProcessedPost
} from "./db-fixture";

const db = new DbFixture();
// const parser = new XMLParser();
// const nlp = winkNLP( model );
// const its = nlp.its;

db.on("populate", () => {
  // db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  // db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  // db.feeds.bulkAdd(defaultFeeds as Feed[]);
  db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  // db.trainlabels.bulkAdd(defaultTrainLabels as TrainLabel[]);
  // db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
  // db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
});

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
  const corsProxies = createDexieArrayQuery(() => db.corsproxies.toArray());

  const putCorsProxy = async (newCorsProxy: CorsProxy) => {
    await db.corsproxies.put(newCorsProxy)
  }
  const removeCorsProxy = async (corsProxyToRemove: CorsProxy) => {
    await db.corsproxies.where('id').equals(corsProxyToRemove?.id).delete()
  }


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
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} value="cors">Cors&nbsp;Proxies</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} value="contact">Contact</Tabs.Trigger></div>
              </Tabs.List>
            </div>
          </div>
          <div class='w-full h-screen font-sans fade-in'>
            <div class='flex flex-col m-5 h-9/10'>
              <Tabs.Content class='animate-fade-in animate-duration-.3s' value="profile">
                <Profile
                  albyCodeVerifier={albyCodeVerifier}
                  setAlbyCodeVerifier={setAlbyCodeVerifier}
                  albyCode={albyCode}
                  setAlbyCode={setAlbyCode}
                  albyTokenReadInvoice={albyTokenReadInvoice}
                  setAlbyTokenReadInvoice={setAlbyTokenReadInvoice}
                />
              </Tabs.Content>
              <Tabs.Content class='animate-fade-in animate-duration-.3s' value="cors">
                <CorsProxies
                  corsProxies={corsProxies}
                  putCorsProxy={putCorsProxy}
                  removeCorsProxy={removeCorsProxy}
                />
              </Tabs.Content>
              <Tabs.Content class='animate-fade-in animate-duration-.3s' value="contact"><Contact/></Tabs.Content>
            </div>
          </div>
        </div>
      </Tabs.Root>
    </div>
  )
};
export default App;
import type { Component, Signal} from 'solid-js';
import { createSignal } from 'solid-js';
import { Button, Tabs } from "@kobalte/core";
import { createDexieArrayQuery } from "solid-dexie";
import winkNLP from 'wink-nlp'
import model from 'wink-eng-lite-web-model'

import Contact from './Contact';
import CorsProxies from './CorsProxies';
import NostrRelays from './NostrRelays';
import NostrKeys from './NostrKeys';
import Classifiers from './Classifiers';
import Profile from './Profile';
import TrainLabels from './TrainLabels';

import defaultCorsProxies from './defaultCorsProxies';
import defaultNostrRelays from './defaultNostrRelays';
import defaultNostrKeys from './defaultNostrKeys';
import defaultClassifiers from './defaultClassifiers';
import defaultTrainLabels from './defaultTrainLabels';

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
const nlp = winkNLP( model );
const its = nlp.its;
// const parser = new XMLParser();

db.on("populate", () => {
  db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  // db.feeds.bulkAdd(defaultFeeds as Feed[]);
  db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  db.trainlabels.bulkAdd(defaultTrainLabels as TrainLabel[]);
  db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
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

const prepTask = function ( text: string ) {
  const tokens: string[] = [];
  nlp.readDoc(text)
      .tokens()
      // Use only words ignoring punctuations etc and from them remove stop words
      .filter( (t: any) => ( t.out(its.type) === 'word' && !t.out(its.stopWordFlag) ) )
      // Handle negation and extract stem of the word
      .each( (t: any) => tokens.push( (t.out(its.negationFlag)) ? '!' + t.out(its.stem) : t.out(its.stem) ) );
  return tokens;
};

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
  const nostrRelays = createDexieArrayQuery(() => db.nostrrelays.toArray());
  const checkedNostrRelays = createDexieArrayQuery(() => db.nostrrelays
    .filter(relay => relay.checked === true)
    .toArray()
    );
  const putNostrRelay = async (newNostrRelay: NostrRelay) => {
    await db.nostrrelays.put(newNostrRelay)
  };
  const removeNostrRelay = async (nostrRelayToRemove: NostrRelay) => {
    await db.nostrrelays.where('id').equals(nostrRelayToRemove?.id).delete()
  };
  const nostrKeys = createDexieArrayQuery(() => db.nostrkeys.toArray());
  const putNostrKey = async (newKey: NostrKey) => {
    await db.nostrkeys.put(newKey)
  }
  const removeNostrKey = async (nostrKeyRemove: NostrKey) => {
    await db.nostrkeys.where('publicKey').equals(nostrKeyRemove.publicKey).delete()
  }
  const classifiers = createDexieArrayQuery(() => db.classifiers.toArray());
  const putClassifier = async (newClassifierEntry: Classifier) => {
    const winkClassifier = WinkClassifier()
    winkClassifier.definePrepTasks( [ prepTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
    if (newClassifierEntry.model != '') {
      winkClassifier.importJSON(newClassifierEntry.model)
    }
    if (newClassifierEntry.model === '') {
      return
    }
    if (newClassifierEntry?.id === undefined) {
      return
    }
    await db.classifiers.put(newClassifierEntry)
  }

  const trainLabels = createDexieArrayQuery(() => db.trainlabels.toArray());
  const removeClassifier = async (classifierToRemove: Classifier) => {
    await db.classifiers.where('id').equals(classifierToRemove?.id).delete()
  }
  const putTrainLabel = async (newTrainLabel: TrainLabel) => {
    await db.trainlabels.put(newTrainLabel)
  }
  const removeTrainLabel = async (trainLabelToRemove: TrainLabel) => {
    await db.trainlabels.where('id').equals(trainLabelToRemove?.id).delete()
  }
  
  return (
    <div>
      <Tabs.Root>
        <div class='flex flex-column'>
          <div class={`${navIsOpen() ? `w-3/6` : 'w-0'}  transition-width ease-in-out transition-duration-.5s`}>
            <div class={`bg-red-900 rounded-2`}>
              <div>
                <Button.Root
                  class={`${navIsOpen() ? '' : 'hidden'} text-4xl text-white bg-transparent border-none hover-text-white hover:bg-slate-900 rounded-full`}
                  onClick={event => {
                    event.preventDefault()
                    setNavIsOpen(false)
                  }}
                >
                  ⭠
                </Button.Root>
              </div>
              <Tabs.List>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="profile">Profile</Tabs.Trigger><div /></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="cors">Cors&nbsp;Proxies</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="contact">Contact</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="nostrrelays">Nostr&nbsp;Relays</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="nostrkeys">Nostr&nbsp;Keys</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="classifiers">Classifiers</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="trainlabels">Train Labels</Tabs.Trigger></div>
              </Tabs.List>
            </div>
          </div>
          <div class={`font-sans`}>
            <div>
              <Tabs.Content value="profile">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                    <Profile
                      albyCodeVerifier={albyCodeVerifier}
                      setAlbyCodeVerifier={setAlbyCodeVerifier}
                      albyCode={albyCode}
                      setAlbyCode={setAlbyCode}
                      albyTokenReadInvoice={albyTokenReadInvoice}
                      setAlbyTokenReadInvoice={setAlbyTokenReadInvoice}
                    />
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="cors">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                  <CorsProxies
                    corsProxies={corsProxies}
                    putCorsProxy={putCorsProxy}
                    removeCorsProxy={removeCorsProxy}
                  />
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="contact">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                    <Contact/>
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="nostrrelays">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                    <NostrRelays
                      nostrRelays={nostrRelays}
                      putNostrRelay={putNostrRelay}
                      removeNostrRelay={removeNostrRelay}
                    />
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="nostrkeys">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                    <NostrKeys
                      nostrKeys={nostrKeys}
                      putNostrKey={putNostrKey}
                      removeNostrKey={removeNostrKey}
                    />
                  </div>
                </div>
              </Tabs.Content>
              <Tabs.Content value="classifiers">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                    <Classifiers
                      classifiers={classifiers}
                      putClassifier={putClassifier}
                      removeClassifier={removeClassifier}
                    />
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="trainlabels">
                <div class='flex sm:flex-row flex-col'>
                  <div class={navIsOpen() ? 'hidden' : ''}>
                    <Button.Root
                      class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red-900 rounded-full`}
                      onClick={event => {
                        event.preventDefault()
                        setNavIsOpen(true)
                      }}
                    >⭢
                    </Button.Root>
                  </div>
                  <div class='ml-2'>
                    <TrainLabels
                      trainLabels={trainLabels}
                      putTrainLabel={putTrainLabel}
                      removeTrainLabel={removeTrainLabel}
                    />
                  </div>
                </div>
              </Tabs.Content>
              
            </div>
          </div>
        </div>
      </Tabs.Root>
    </div>
  )
};
export default App;
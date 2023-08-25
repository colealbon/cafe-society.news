import { convert } from 'html-to-text'
import type {
  Component,
  Signal
} from 'solid-js';
import {
  createEffect,
  createSignal,
  createResource
} from 'solid-js';
import { Button, Tabs } from "@kobalte/core";
import { createDexieArrayQuery } from "solid-dexie";
import WinkClassifier from 'wink-naive-bayes-text-classifier';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import {
  NostrFetcher
  , eventKind
} from "nostr-fetch";

import Contact from './Contact';
import CorsProxies from './CorsProxies';
import NostrRelays from './NostrRelays';
import NostrKeys from './NostrKeys';
import Classifiers from './Classifiers';
import Profile from './Profile';
import TrainLabels from './TrainLabels';
import NostrPosts from './NostrPosts';

import defaultCorsProxies from './defaultCorsProxies';
import defaultNostrRelays from './defaultNostrRelays';
import defaultNostrKeys from './defaultNostrKeys';
import defaultClassifiers from './defaultClassifiers';
import defaultTrainLabels from './defaultTrainLabels';
import defaultProcessed from './defaultProcessed';
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


const fetcher = NostrFetcher.init();

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
  db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
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

const prepNostrPost = (post: any) => {
  return {
    mlText: prepTask(convert(
      `${post.content}`
      .replace(/\d+/g, '')
      .replace(/#/g, ''),
      {
        ignoreLinks: true,
        ignoreHref: true,
        ignoreImage: true,
        linkBrackets: false,
        wordwrap: false
      }
    )
    )
    .filter((word: string) => word.length < 30)
    .filter((word: string) => word!='nostr')
    .filter((word: string) => word!='vmess')
    .join(' ')
    .toLowerCase() || '',

    links: convert(
      `${post.content}`,
      {
        ignoreLinks: true,
        ignoreHref: true,
        ignoreImage: true,
        linkBrackets: false,
        wordwrap: false
      }
      ).toLowerCase().match(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g),
    ...post
  }
}

const applyPrediction = (params: {
  post: any,
  classifier: any
}) => {
  try {
    const docCount: number = params.classifier.stats().labelWiseSamples ? Object.values(params.classifier.stats().labelWiseSamples).reduce((val, runningTotal: any) => val as number + runningTotal, 0) as number : 0
    if (docCount > 2) {
      params.classifier.consolidate()
    }
    const prediction = Object.fromEntries(params.classifier.computeOdds(params.post?.mlText))
    const postWithPrediction = {
      ...params.post,
      ...{
        'prediction': prediction,
        'docCount': docCount
      }
    }
    return postWithPrediction
  } catch (error) {
    if (error != null) {
      const newPost = params.post
      newPost.prediction = params.classifier.stats()
      return newPost
    }
  }
}

const App: Component = () => {
  const navButtonStyle=`text-xl text-white border-none transition-all bg-transparent`
  const [navIsOpen, setNavIsOpen] = createStoredSignal('isNavOpen', false);
  const [albyCodeVerifier, setAlbyCodeVerifier] = createStoredSignal('albyCodeVerifier', '')
  const [albyCode, setAlbyCode] = createStoredSignal('albyCode', '')
  const [albyTokenReadInvoice, setAlbyTokenReadInvoice] = createStoredSignal('albyTokenReadInvoice', '')
  const [selectedTrainLabel, setSelectedTrainLabel] = createStoredSignal('selectedTrainLabel', '')
    const [selectedNostrAuthor, setSelectedNostrAuthor] = createStoredSignal('selectedNostrAuthor', '')
  
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

  const train = (params: {
    mlText: string,
    mlClass: string,
    trainLabel: string
  }) => {
    const oldModel: string = classifiers.find((classifierEntry) => classifierEntry?.id == params.trainLabel)?.model || ''
    const winkClassifier = WinkClassifier()
    winkClassifier.definePrepTasks( [ prepTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
    if (oldModel != '') {
      winkClassifier.importJSON(oldModel)
    }
    winkClassifier.learn(params.mlText, params.mlClass)
    const newModel: string = winkClassifier.exportJSON()
    const newClassifierEntry = {
      id: params.trainLabel,
      model: newModel,
      thresholdSuppressDocCount: '10',
      thresholdPromoteDocCount: '10'
    }
    putClassifier(newClassifierEntry)
  }

  const [nostrQuery, setNostrQuery] = createSignal('')

  const processedPosts = createDexieArrayQuery(() => db.processedposts.toArray());

  const putProcessedPost = async (newProcessedPost: ProcessedPost) => {
    await db.processedposts.put(newProcessedPost)
  }

  const markComplete = (postId: string, feedId: string) => {
    const newProcessedPostsForFeed = processedPosts.find((processedPostForFeed) => processedPostForFeed.id == feedId)?.processedPosts?.slice()
    putProcessedPost({
      id: feedId,
      processedPosts: Array.from(new Set([newProcessedPostsForFeed, postId].flat())) as string[]
    })
  }

  const ignoreNostrKeys = createDexieArrayQuery(() => db.nostrkeys
  .filter(nostrKey => nostrKey.ignore === true)
  .toArray()
  );

  createEffect(() => {
    const nostrRelayList = checkedNostrRelays
      .map((relay: NostrRelay) => relay.id)
    const nostrAuthor = selectedNostrAuthor()
    const newQuery = JSON.stringify({
      'nostrRelayList': nostrRelayList,
      'nostrAuthor': nostrAuthor,
      'ignore': ignoreNostrKeys,
    })
    setNostrQuery(newQuery)
  })

  function fetchNostrPosts(params: string) {
    return new Promise((resolve) => {
      const paramsObj = JSON.parse(params)
      if (paramsObj.nostrRelayList?.length == 0) {
        return
      }
      const filterOptions = `${paramsObj.nostrAuthor}` != '' ?
      {
        kinds: [ eventKind.text, 30023 ],
        authors: [`${paramsObj.nostrAuthor}`],
      } :
      {
        kinds: [ 1, 30023 ]
      }
      const maxPosts = `${paramsObj.nostrAuthor}` == '' ? 1000 : 1000
      const winkClassifier = WinkClassifier()
      winkClassifier.definePrepTasks( [ prepTask ] );
      winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == 'nostr')?.model || ''
      if (classifierModel != '') {
        winkClassifier.importJSON(classifierModel)
      }

      fetcher.fetchLatestEvents(
        [...paramsObj.nostrRelayList],
        filterOptions,
        maxPosts
      )
      .then((allThePosts: any) => {
        const processedNostrPosts = processedPosts.find((processedPostsEntry) => processedPostsEntry?.id == 'nostr')?.processedPosts
        const suppressOdds = classifiers.find((classifierEntry) => classifierEntry?.id == 'nostr')?.thresholdSuppressOdds
        const filteredPosts = allThePosts
          .filter((nostrPost: any) => `${nostrPost.mlText}`.replace(' ','') != '')
          .filter((nostrPost: any) => {
            return Object.fromEntries(nostrPost.tags)['e'] == null
          })
          .filter((nostrPost: any) => {
            return nostrPost.content.replace('vmess:','').length == nostrPost.content.length
          })
          .filter((nostrPost: any) => !ignoreNostrKeys.find((ignoreKey: {publicKey: string}) => ignoreKey.publicKey == nostrPost.pubkey))
          .map((nostrPost: any) => prepNostrPost(nostrPost))
          .filter((nostrPost: any) => {
            return [processedNostrPosts].flat()?.indexOf(nostrPost.mlText) == -1
          })
          .map((post: any) => applyPrediction({
            post: post,
            classifier: winkClassifier
          }))
          .filter((post: any) => {
            return (post.mlText != '')
          })
          .filter((post: any) => {
            return (post.prediction?.suppress || 0) <= (suppressOdds || 0)
          })
          .filter((post: any) => {
            return ( 0.0 + post.prediction?.suppress || 0.0) != 0.0
          })
        resolve(filteredPosts)
      })
    })
  }
  const [nostrPosts] = createResource(nostrQuery, fetchNostrPosts);
  
  return (
    <div class={`font-sans`}>
      <Tabs.Root>
        <div class='flex flex-column'>
          <div class={`${navIsOpen() ? `w-3/6` : 'w-0'} transition-width ease-in-out transition-duration-.5s`}>
            <div class={`bg-red-900 rounded-2`}>
              <div>
                <Button.Root
                  class={`${navIsOpen() ? '' : 'w-0 bg-transparent hover:bg-transparent'} text-4xl text-white bg-transparent border-none hover-text-white hover:bg-slate-900 rounded-full`}
                  onClick={event => {
                    event.preventDefault()
                    setNavIsOpen(false)
                  }}
                >
                  ⭠
                </Button.Root>
              </div>
              <Tabs.List>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="nostrposts">nostr&nbsp;global</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="profile">Profile</Tabs.Trigger><div /></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="cors">Cors&nbsp;Proxies</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="contact">Contact</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="nostrrelays">Nostr&nbsp;Relays</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="nostrkeys">Nostr&nbsp;Keys</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="classifiers">Classifiers</Tabs.Trigger></div>
                <div class='w-full hover:bg-slate-900'><Tabs.Trigger class={navButtonStyle} onClick={() => setNavIsOpen(false)} value="trainlabels">Train&nbspLabels</Tabs.Trigger></div>
              </Tabs.List>
            </div>
          </div>
          <div>
            <Tabs.Content value="nostrposts">
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
                <NostrPosts
                  selectedTrainLabel='nostr'
                  train={(params: {
                    mlText: string,
                    mlClass: string,
                    trainLabel: string
                  }) => {
                    train({
                      mlText: params.mlText,
                      mlClass: params.mlClass,
                      trainLabel: 'nostr',
                    })
                  }}
                  nostrPosts={nostrPosts}
                  selectedNostrAuthor={selectedNostrAuthor}
                  setSelectedNostrAuthor={setSelectedNostrAuthor}
                  putNostrKey={putNostrKey}
                  putProcessedPost={putProcessedPost}
                  putClassifier={putClassifier}
                  markComplete={(postId: string) => markComplete(postId, 'nostr')}
                />
                </div>
              </div>
            </Tabs.Content>
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
      </Tabs.Root>
    </div>
  )
};
export default App;
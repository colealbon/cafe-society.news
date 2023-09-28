import { convert } from 'html-to-text'
import {
  For,
  Show,
  createEffect,
  createSignal,
  createResource,
  Switch,
  Match,
  lazy
} from 'solid-js';
import type {
  Component,
  Signal
} from 'solid-js';
import { XMLParser } from 'fast-xml-parser'
import stringSimilarity from 'string-similarity';
import { createDexieArrayQuery } from "solid-dexie";
import WinkClassifier from 'wink-naive-bayes-text-classifier';
import {
  Routes,
  Route,
  A,
  useParams
} from "@solidjs/router";
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import {
  NostrFetcher
  , eventKind
} from "nostr-fetch";
import axios from 'axios';
import Contact from './Contact';
import NostrRelays from './NostrRelays';
import NostrKeys from './NostrKeys';
import Classifiers from './Classifiers';
import TrainLabels from './TrainLabels';
import NostrPosts from './NostrPosts';
import {shortUrl} from './RSSPosts'
import defaultCorsProxies from './defaultCorsProxies';
import defaultNostrRelays from './defaultNostrRelays';
import defaultNostrKeys from './defaultNostrKeys';
import defaultClassifiers from './defaultClassifiers';
import defaultTrainLabels from './defaultTrainLabels';
import defaultProcessed from './defaultProcessed';
import defaultRSSFeeds from './defaultRSSFeeds';
import {
  DbFixture,
  NostrRelay,
  NostrKey,
  TrainLabel,
  RSSFeed,
  CorsProxy,
  Classifier,
  ProcessedPost
} from "./db-fixture";

const fetcher = NostrFetcher.init();
const db = new DbFixture();
const nlp = winkNLP( model );
const its = nlp.its;
const parser = new XMLParser();

const nHoursAgo = (hrs: number): number => Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

db.on("populate", () => {
  db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  db.rssfeeds.bulkAdd(defaultRSSFeeds as RSSFeed[]);
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
  const initialValue = storage.getItem(key) != undefined && storage.getItem(key) !== 'undefined'
    ? JSON.parse(`${storage.getItem(key)}`) as T
    : defaultValue;
  const [value, setValue] = createSignal<T>(initialValue);
  const setValueAndStore = ((arg: any) => {
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
      ).toLowerCase().match(/((file|http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g),
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

const parseRSS = (content:any) => {
  const feedTitle = content.rss.channel.title
  const feedLink = content.rss.channel.link
  const feedDescription = content.rss.channel.description
  const feedPosts = content.rss.channel.item?.length == null ?
    [content.rss.channel.item] :
    content.rss.channel.item

  return [...feedPosts]
    .map((itemEntry) => ({
      feedTitle: feedTitle,
      feedLink: feedLink,
      feedDescription: feedDescription,
      ...itemEntry
    }))
    .map(itemEntry => ({
      postSummary: convert(
        itemEntry.description,
        {
          ignoreLinks: true,
          ignoreHref: true,
          ignoreImage: true,
          linkBrackets: false
        })
      .replace(/\[.*?\]/g, '')
      .replace(/\n/g,' ')?.toString()
      .trim(),
      ...itemEntry
    }))
    .map(itemEntry => ({
      ...itemEntry,
      postId: itemEntry.link || itemEntry.guid,
      postTitle: itemEntry.title,
      mlText: prepTask(convert(`${itemEntry.title} ${itemEntry.postSummary}`))
        .filter((word) => word.length < 30)
        .join(' ')
        .toLowerCase()
    })
  )
}
const parseAtom = (content: any) => {
  const feedTitle = content.feed?.feedTitle
  const feedLink = content.feed?.id
  const feedDescription = content.feed?.subtitle
  const feedPosts = content.feed?.entry
  return feedPosts?.map((itemEntry: any) => ({
      feedTitle: feedTitle,
      feedLink: feedLink,
      feedDescription: feedDescription,
      ...itemEntry[0]
    }))
    .map((itemEntry: any) => ({
      postSummary: convert(itemEntry.content, { ignoreLinks: true, ignoreHref: true, ignoreImage: true, linkBrackets: false  })
      .replace(/\[.*?\]/g, '')
      .replace(/\n/g,' ')?.toString()
      .trim(),
      ...itemEntry
    }))
    .map((itemEntry: any) => ({
      ...itemEntry,
      postId: itemEntry?.id,
      postTitle: `${itemEntry.title}`,
      mlText: prepTask(convert(`${itemEntry.title} ${itemEntry.postSummary}`))
        .filter((word) => word.length < 30)
        .join(' ')
        .toLowerCase()
    })
  )
}
const parsePosts = (postsXML: any[]) => {
  const parseQueue: any[] = []
  postsXML.forEach(xmlEntry => {
    parseQueue.push(new Promise(resolve => {
      try {
        const content = parser.parse(xmlEntry.data)
        const parsed = content.rss ? parseRSS(content) : parseAtom(content)
        resolve(parsed)
      } catch (error) {
        console.log(error)
        console.log(xmlEntry)
        resolve([])
      }
    }))
  })
  return Promise.all(parseQueue)
}

const App: Component = () => {
  const navButtonStyle = () => `no-underline text-left text-xl text-white border-none transition-all bg-transparent hover-text-slate-500 hover-text-4v xl`
  const [navIsOpen, setNavIsOpen] = createSignal(false);
  const [albyCodeVerifier, setAlbyCodeVerifier] = createStoredSignal('albyCodeVerifier', '')
  const [albyCode, setAlbyCode] = createStoredSignal('albyCode', '')
  const [albyTokenReadInvoice, setAlbyTokenReadInvoice] = createStoredSignal('albyTokenReadInvoice', '')
  const [selectedTrainLabel, setSelectedTrainLabel] = createStoredSignal('selectedTrainLabel', '')
  const [selectedPage, setSelectedPage] = createStoredSignal('selectedPage', '')
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
  const checkedTrainLabels = createDexieArrayQuery(() => db.trainlabels
  .filter(label => label.checked === true)
  .toArray()
  );

  const removeClassifier = async (classifierToRemove: Classifier) => {
    await db.classifiers.where('id').equals(classifierToRemove?.id).delete()
  }
  createEffect(() => {
    const feedsForTrainLabel = checkedFeeds
      .filter((feed) => {
        return selectedTrainLabel() === '' || feed.trainLabels.indexOf(selectedTrainLabel()) !== -1
      })
      .map((feed: RSSFeed) => feed.id)
    const corsProxyList = checkedCorsProxies
      .map((corsProxy) => corsProxy.id)
    setFetchRssParams(JSON.stringify({
      feedsForTrainLabel: feedsForTrainLabel,
      corsProxies: corsProxyList
    }))
  })

  const putTrainLabel = async (newTrainLabel: TrainLabel) => {
    await db.trainlabels.put(newTrainLabel)
  }
  const removeTrainLabel = async (trainLabelToRemove: TrainLabel) => {
    await db.trainlabels.where('id').equals(trainLabelToRemove?.id).delete()
  }

  const rssFeeds = createDexieArrayQuery(() => db.rssfeeds.toArray());

  const checkedRSSFeeds = createDexieArrayQuery(() => db.rssfeeds
    .filter(feed => feed.checked === true)
    .toArray());

  const putRSSFeed = async (newRSSFeed: RSSFeed) => {
    await db.rssfeeds.put(newRSSFeed)
  }
  const removeRSSFeed = async (rssFeedToRemove: RSSFeed) => {
    await db.rssfeeds.where('id').equals(rssFeedToRemove?.id).delete()
  }

  const checkedFeeds = createDexieArrayQuery(() => db.rssfeeds
    .filter(rssfeed => rssfeed.checked === true)
    .toArray());

  const checkedCorsProxies = createDexieArrayQuery(() => db.corsproxies
    .filter(corsProxy => corsProxy.checked === true)
    .toArray());

  function fetchRssPosts(params: string) {
    if (params == '') {
      return
    }
    const paramsObj = JSON.parse(params)
    if (paramsObj.feedsForTrainLabel.length < 1) {
      return
    }
    return new Promise((resolve) => {
      const fetchQueue: any[] = []
      paramsObj.feedsForTrainLabel.forEach((feed: RSSFeed) => {
        fetchQueue.push(new Promise((resolve) => {
          try {
            paramsObj.corsProxies?.slice().forEach((corsProxy: any) => {
              try {
                axios.get(`${corsProxy}${feed}`)
                .then(response => {
                  resolve(response)
                })
              } catch(error) {
                console.log(`${corsProxy}${feed} failed`)
                console.log(error)
              }
            })
          } catch (error) {
            resolve('')
          }
        }))
      })
      const winkClassifier = WinkClassifier()
      winkClassifier.definePrepTasks( [ prepTask ] );
      winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == selectedTrainLabel())?.model || ''
      if (classifierModel != '') {
        winkClassifier.importJSON(classifierModel)
      }
      Promise.all(fetchQueue)
      .then(fetchedPosts => parsePosts(fetchedPosts))
      .then((parsed: any[]) => {
        if ([parsed?.flat()].length === 0) {
          resolve([])
        }
        const suppressOdds = classifiers.find((classifierEntry) => classifierEntry?.id == selectedTrainLabel())?.thresholdSuppressOdds
        resolve(parsed?.flat()
        .filter(post => `${post?.mlText}`.trim() != '')
        .map(post => {
          return {
            ...post,
            postTitle: post?.postTitle
            .replace(/&#039;/g, "'")
            .replace(/&#8217;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&#8216;/g, "'")
            .replace(/&#8230;/g, "…")
            .replace(/&#038;/g, "&")
            .replace(/&#x2019;/g,"'")
            .replace(/&#x2018;/g,"'")

          }
        })
        .filter((postItem: any) => {
          const processedPostsID = postItem.feedLink === "" ? postItem.guid : shortUrl(postItem.feedLink)
          const processedPostsForFeedLink = processedPosts.find((processedPostsEntry) => processedPostsEntry?.id == processedPostsID)?.processedPosts
          if (processedPostsForFeedLink == undefined) {
            return true
          }
          return !processedPosts.find((processedPost) => {
            const similarity = stringSimilarity.compareTwoStrings(
              `${processedPost}`,
              `${postItem.mlText}`
            );
            return similarity > 0.8;
          });
        })
        .map((post: any) => applyPrediction({
          post: post,
          classifier: winkClassifier
        }))
        .filter((post: any) => {
          return (post.prediction?.suppress || 0) <= (suppressOdds || 0)
        })
        .sort((a: any, b: any) => (a.prediction.suppress > b.prediction.suppress) ? 1 : -1)
        )
      })
    })
  }

  const handleFeedToggleChecked = (id: string) => {
    const valuesForSelectedFeed = rssFeeds
    .find(feed => feed['id'] === id)

    const newValueObj = {
        ...valuesForSelectedFeed
      , checked: !valuesForSelectedFeed?.checked
    }
    putRSSFeed({...newValueObj} as RSSFeed)
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
  const [fetchRssParams, setFetchRssParams] = createSignal('')

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
      // const maxPosts = `${paramsObj.nostrAuthor}` == '' ? 10000 : 10000
      const winkClassifier = WinkClassifier()
      winkClassifier.definePrepTasks( [ prepTask ] );
      winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == 'nostr')?.model || ''
      if (classifierModel != '') {
        winkClassifier.importJSON(classifierModel)
      }

      fetcher.fetchAllEvents(
        [...paramsObj.nostrRelayList],
        filterOptions,
        { since: nHoursAgo(6) }
        // maxPosts
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
          .filter((postItem: {mlText: string}) => {
            return !processedPosts.find((processedPost) => {
              const similarity = stringSimilarity.compareTwoStrings(
                `${processedPost}`,
                `${postItem.mlText}`
              );
              return similarity > 0.8;
            });
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
          .sort((a: any, b: any) => (a.prediction.suppress > b.prediction.suppress) ? 1 : -1)
        resolve(filteredPosts)
      })
    })
  }
  const [nostrPosts] = createResource(nostrQuery, fetchNostrPosts);
  const [rssPosts, {mutate: mutateRssPosts}] = createResource(fetchRssParams, fetchRssPosts);

  return (
    <div class={`font-sans`}>
      <div class={`${navIsOpen() ? 'bg-slate-900' : ''} rounded-2`}>
        <div class='text-2xl transition-all'>
          <button
            class={`${navIsOpen() ? 
              'hover-text-slate-900 bg-slate-900 text-white' : 
              'hover-bg-slate-900 hover-text-white bg-transparent'} 
                border-none rounded-full transition-all duration-500 text-4xl mt-1`}
            onClick={event => {
              event.preventDefault()
              setNavIsOpen(!navIsOpen())
            }}
          >
            {`${navIsOpen() ? '≡' : '≡'}`}
          </button>
        </div>
        <div class={`${navIsOpen() ? 'flex flex-col text-left pl-3' : 'h-0 '} transition-all`}>
          <Show when={navIsOpen()}>
            <A href='/rssposts'
              class={`${navButtonStyle()}`}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('rssposts')
              }}
            >
              RSS&nbsp;Posts
            </A>
            <For each={checkedTrainLabels}>
              {
                (trainLabel) => (
                  <div class='ml-4 hover:text-slate-900'>
                    <A href={`/rssposts/${trainLabel.id}`}
                      class={navButtonStyle()}
                      onClick={() => {
                        mutateRssPosts(() => [])
                        setNavIsOpen(false)
                        setSelectedTrainLabel(trainLabel.id)
                        setSelectedPage('rssposts')
                      }} 
                    >
                      {`${trainLabel.id}`}
                    </A>
                  </div>
                )
              }
            </For>
            <A href='/rssfeeds'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('rssfeeds')
              }}
            >
              RSS&nbsp;Feeds
            </A>
            <A href='/nostrposts'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('nostr')
                setSelectedPage('nostrposts')
              }}
            >
              Nostr&nbsp;Global&nbsp;(6&nbsp;hours)
            </A>
            <A href='/profile'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('profile')
              }}
            >
              Profile
            </A>
            <A href='/cors'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('cors')
              }}
            >
              Cors&nbsp;Proxies
            </A>
            <A href='/contact'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('contact')
              }}
            >
              Contact
            </A>
            <A href='/nostrrelays'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('nostrrelays')
              }}
            >
              Nostr&nbsp;Relays
            </A>
            <A href='/nostrkeys'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('nostrkeys')
              }}
            >
              Nostr&nbsp;Keys
            </A>
            <A href='/classifiers'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('classifiers')
              }}
            >
              Classifiers
            </A>
            <A href='/trainlabels'
              class={navButtonStyle()}
              onClick={() => {
                setNavIsOpen(false)
                setSelectedTrainLabel('')
                setSelectedPage('trainlabels')
              }}
            >
              Train&nbsp;Labels
            </A>
          </Show>
        </div>
      </div>

      <Show when={navIsOpen() == false}>
      <Routes>
        <Route path='/cors' component={() => {
          const CorsProxies = lazy(() => import("./CorsProxies"))
          return <CorsProxies
            corsProxies={corsProxies}
            putCorsProxy={putCorsProxy}
            removeCorsProxy={removeCorsProxy}
          />
        }} />
        <Route path='/profile' component={() => {
          const Profile = lazy(() => import("./Profile"))
          return <Profile
            albyCodeVerifier={albyCodeVerifier}
            setAlbyCodeVerifier={setAlbyCodeVerifier}
            albyCode={albyCode}
            setAlbyCode={setAlbyCode}
            albyTokenReadInvoice={albyTokenReadInvoice}
            setAlbyTokenReadInvoice={setAlbyTokenReadInvoice}
          />
        }}/>
        <Route path='/rssfeeds' component={() => {
          const RSSFeeds = lazy(() => import("./RSSFeeds"))
          return <RSSFeeds
            rssFeeds={rssFeeds}
            putFeed={putRSSFeed}
            removeFeed={removeRSSFeed}
            trainLabels={trainLabels}
            handleFeedToggleChecked={(id: string) => handleFeedToggleChecked(id)}
          />
        }}/>

        <Route path='/rssposts' component={() => {
          const RSSPosts = lazy(() => import("./RSSPosts"))
          return <RSSPosts
            trainLabel={selectedTrainLabel() || ''}
            setSelectedTrainLabel={setSelectedTrainLabel}
            train={(params: {
              mlText: string,
              mlClass: string,
              trainLabel: string
            }) => {
              train({
                mlText: params.mlText,
                mlClass: params.mlClass,
                trainLabel: selectedTrainLabel() || '',
              })
            }}
            markComplete={(postId: string, feedId: string) => markComplete(postId, feedId)}
            rssPosts={rssPosts()}
          />
        }} />

        <Route path='/rssposts/:trainlabel' component={() => {
          const RSSPosts = lazy(() => import("./RSSPosts"))
          const {trainlabel} = useParams()
          return <RSSPosts
            trainLabel={selectedTrainLabel() || ''}
            setSelectedTrainLabel={setSelectedTrainLabel}
            train={(params: {
              mlText: string,
              mlClass: string,
              trainLabel: string
            }) => {
              train({
                mlText: params.mlText,
                mlClass: params.mlClass,
                trainLabel: selectedTrainLabel() || '',
              })
            }}
            markComplete={(postId: string, feedId: string) => markComplete(postId, feedId)}
            rssPosts={rssPosts()}
          />
        }} />
        <Route 
          path='/nostrposts'
          component={() => {
            return (
              <NostrPosts
                selectedTrainLabel='nostr'
                train={(params: 
                  {
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
            )
          }}
        />

          <Route path='/contact' component={() => {
            return <Contact/>
          }} />

          <Route path='/nostrrelays' component={() => {
            return <NostrRelays
              nostrRelays={nostrRelays}
              putNostrRelay={putNostrRelay}
              removeNostrRelay={removeNostrRelay}
              />
          }} />
          <Route path='/nostrKeys' component={() => {
            return <NostrKeys
              nostrKeys={nostrKeys}
              putNostrKey={putNostrKey}
              removeNostrKey={removeNostrKey}
/>}} />
          <Route path='/classifiers' component={() => {
            return <Classifiers
              classifiers={classifiers}
              putClassifier={putClassifier}
              removeClassifier={removeClassifier}
/>}} />
          <Route path='/trainlabels' component={() => {
            return <TrainLabels
              trainLabels={trainLabels}
              putTrainLabel={putTrainLabel}
              removeTrainLabel={removeTrainLabel}
/>}} />
        <Route path="/" component={() => (
          <Switch fallback={<Contact/>}>
        </Switch>)
        }/>
      </Routes>
      </Show>
    </div>
  )
};
export default App;
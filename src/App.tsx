import { Button } from './components/Button';
import { NavBar } from './components/NavBar'
import {
  createSignal,
  createResource,
  lazy,
  createEffect
} from 'solid-js';
import type {
  Component
} from 'solid-js';
import stringSimilarity from 'string-similarity';
import { createDexieArrayQuery } from "solid-dexie";
import WinkClassifier from 'wink-naive-bayes-text-classifier';
import {
  Routes,
  Route,
  useParams,
  useSearchParams
} from "@solidjs/router";
import { NostrFetcher } from "nostr-fetch";
import Payment from './Payment';
import Contact from './Contact';
import NostrRelays from './NostrRelays';
import NostrKeys from './NostrKeys';
import Classifiers from './Classifiers';
import TrainLabels from './TrainLabels';
import NostrPosts from './NostrPosts';
import Prompt from './Prompt';
import defaultMetadata from './defaultMetadata';
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
import {
  nHoursAgo,
  prepNostrPost,
  prepNLPTask,
  shortUrl,
  createStoredSignal,
  applyPrediction,
  parsePosts,
  fetchRssPosts
} from './util';
const fetcher = NostrFetcher.init();
const db = new DbFixture();
db.on("populate", () => {
  db.nostrkeys.bulkAdd(defaultNostrKeys as NostrKey[]);
  db.nostrrelays.bulkAdd(defaultNostrRelays as NostrRelay[]);
  db.rssfeeds.bulkAdd(defaultRSSFeeds as RSSFeed[]);
  db.corsproxies.bulkAdd(defaultCorsProxies as CorsProxy[]);
  db.trainlabels.bulkAdd(defaultTrainLabels as TrainLabel[]);
  db.classifiers.bulkAdd(defaultClassifiers as Classifier[]);
  db.processedposts.bulkAdd(defaultProcessed as ProcessedPost[]);
});

const App: Component = () => {
  const [params, setParams] = useSearchParams();
  const [navIsOpen, setNavIsOpen] = createSignal(false);
  const [albyCodeVerifier, setAlbyCodeVerifier] = createStoredSignal('albyCodeVerifier', '')
  const [albyCode, setAlbyCode] = createStoredSignal('albyCode', '')
  const [albyTokenReadInvoice, setAlbyTokenReadInvoice] = createStoredSignal('albyTokenReadInvoice', '')
  const [selectedTrainLabel, setSelectedTrainLabel] = createStoredSignal('selectedTrainLabel', '')
  const [selectedMetadata, setSelectedMetadata] = createStoredSignal('selectedMetadata', {title:'', description:'', keywords: ''})
  const [parsedRSSPosts, setParsedRSSPosts] = createSignal('')
  const [preppedRSSPosts, setPreppedRSSPosts] = createSignal('')
  const [dedupedRSSPosts, setDedupedRSSPosts] = createSignal('')
  const [scoredRSSPosts, setScoredRSSPosts] = createSignal('')
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
    winkClassifier.definePrepTasks( [ prepNLPTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
    if (newClassifierEntry.model != '') {
      winkClassifier.importJSON(newClassifierEntry.model)
    }
    if (newClassifierEntry.model === '' || newClassifierEntry?.id === undefined) {
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
  createEffect(() => {
    if (dedupedRSSPosts() == '') {
      return
    }
    const suppressOdds: number = parseFloat(classifiers.find((classifierEntry) => classifierEntry?.id == selectedTrainLabel())?.thresholdSuppressOdds || '999')
    const winkClassifier = WinkClassifier()
    winkClassifier.definePrepTasks( [ prepNLPTask ] );
    winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
 
    // const modelOverride = params['model'] ? decodeURIComponent(atob(params['model'])) : null
    // console.log(modelOverride)

    const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == selectedTrainLabel())?.model || ''
    if (classifierModel != '') {
      winkClassifier.importJSON(classifierModel)
    }

    const newScoredRSSPosts = JSON.parse(dedupedRSSPosts()) && JSON.parse(dedupedRSSPosts())
      .map((post: {
        prediction: any,
        classifier: any
      }) => applyPrediction({
        post: post,
        classifier: winkClassifier
      }))
      .sort((a: any, b: any) => (a.prediction.suppress > b.prediction.suppress) ? 1 : -1)
      .filter((post: {
        prediction: {
          promote: number
        }
      }) => {
        if (`${selectedTrainLabel}` == '') {
          return true
        }
        if (suppressOdds == undefined ) {
          return true
        }
        if (post.prediction.promote == undefined) {
          return true
        }
        return post.prediction.promote >= suppressOdds * -1
      })
      setScoredRSSPosts(JSON.stringify(newScoredRSSPosts))
  })
  createEffect(() => {
    if (preppedRSSPosts() == '') {
      return
    }
    const newDedupedRSSPosts = JSON.parse(preppedRSSPosts()) && JSON.parse(preppedRSSPosts())
    .filter((postItem: any) => {
      const processedPostsID = postItem.feedLink === "" ? postItem.guid : shortUrl(postItem.feedLink)
      const processedPostsForFeedLink = processedPosts.find((processedPostsEntry) => processedPostsEntry?.id == processedPostsID)?.processedPosts
      if (processedPostsForFeedLink == undefined) {
        return true
      }
      return !processedPostsForFeedLink.find((processedPost) => {
        // replace this with winkNLP version of string similarity
        const similarity = stringSimilarity.compareTwoStrings(
          `${processedPost}`,
          `${postItem.mlText}`
        );
        return similarity > 0.8;
      });
    })
    // console.log(newDedupedRSSPosts)
    setDedupedRSSPosts(JSON.stringify(newDedupedRSSPosts))
  })
  createEffect(() => {
  if (`${parsedRSSPosts()}` === '') {
    return
  }
  const newPreppedRSSPosts = JSON.parse(parsedRSSPosts()).flat() && JSON.parse(parsedRSSPosts()).flat()
    .filter((post: {mlText: string}) => post && `${post.mlText}`.trim() != '')
    .filter((post: {postTitle: string}) => {
      return post.postTitle != null
    })
    .map((post: {postTitle: string})  => {
      // replace this big replace with html innerText?
      return {
        ...post,
        postTitle: post?.postTitle
        .replace(/&#039;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#8211;/g, "-")
        .replace(/&#8216;/g, "'")
        .replace(/&#8230;/g, "…")
        .replace(/&#038;/g, "&")
        .replace(/&#8221;/g, "'")
        .replace(/&#8220;/g, "'")
        .replace(/&#x2019;/g,"'")
        .replace(/&#x2018;/g,"'")
        .replace(/&#39;/g,"'")
        .replace(/&#34;/g,"'")
        .replace(/&gt;/g,">")
        .replace(/&lt;/g,"<")
        .replace(/&#43;/g,"+")
      }
    })
    .filter((post: {
      feedLink?: string,
      guid: string
    }) => post?.feedLink || post?.guid != null)
      setPreppedRSSPosts(JSON.stringify(newPreppedRSSPosts))
    })
  createEffect(() => {
    if (fetchedRSSPosts() == undefined) {
      return
    }
    try {
      if (!JSON.parse(fetchedRSSPosts() as string)) {
        return
      }
    } catch {
      return
    }
    const fetchedRSSPostsStr: string = fetchedRSSPosts() as unknown as string
    if (fetchedRSSPostsStr === '') {
      return
    }
    const fetchedPostsArr = JSON.parse(fetchedRSSPostsStr)
    parsePosts(fetchedPostsArr)
    .then((newParsedPosts) => {
        if ([newParsedPosts?.flat()].length === 0) {
          return
        }
      const newParsedPostsStr: string = JSON.stringify(newParsedPosts)
      setParsedRSSPosts(newParsedPostsStr)
    })
  })

  createEffect(() => {
    // @ts-ignore
    const newSelectedMetadata: {description: string, title:string, keywords: string} = defaultMetadata[`${selectedTrainLabel()}`] || {description: '', title:'cafe-society.news', keywords: ''}
    setSelectedMetadata(newSelectedMetadata)
  })
  const putTrainLabel = async (newTrainLabel: TrainLabel) => {
    await db.trainlabels.put(newTrainLabel)
  }
  const removeTrainLabel = async (trainLabelToRemove: TrainLabel) => {
    await db.trainlabels.where('id').equals(trainLabelToRemove?.id).delete()
  }
  const rssFeeds = createDexieArrayQuery(() => db.rssfeeds.toArray());
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

  const handleFeedToggleChecked = (id: string) => {
    const valuesForSelectedFeed = rssFeeds.find(feed => feed['id'] === id)
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
    const thresholdSuppressOdds: string = classifiers.find((classifierEntry) => classifierEntry?.id == params.trainLabel)?.thresholdSuppressOdds || '999'
    const winkClassifier = WinkClassifier()
    winkClassifier.definePrepTasks( [ prepNLPTask ] );
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
      thresholdPromoteDocCount: '10',
      thresholdSuppressOdds: thresholdSuppressOdds
    }
    // console.log(newClassifierEntry)
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
    const nostrRelayList = checkedNostrRelays.map((relay: NostrRelay) => relay.id)
    const newQuery = JSON.stringify({
      'nostrRelayList': nostrRelayList,
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
      const filterOptions = {
        kinds: [ 1, 30023 ]
      }
      const winkClassifier = WinkClassifier()
      winkClassifier.definePrepTasks( [ prepNLPTask ] );
      winkClassifier.defineConfig( { considerOnlyPresence: true, smoothingFactor: 0.5 } );
      const classifierModel: string = classifiers.find((classifierEntry: any) => classifierEntry?.id == 'nostr')?.model || ''
      if (classifierModel != '') {
        winkClassifier.importJSON(classifierModel)
      }
      fetcher.fetchAllEvents(
        [...paramsObj.nostrRelayList],
        filterOptions,
        { since: nHoursAgo(6) }
      )
      .then((allThePosts: any) => {
        const processedNostrPosts = [processedPosts.find((processedPostsEntry) => processedPostsEntry?.id == 'nostr')?.processedPosts].flat().map((post) => post?.toString().split(' ').slice(0, 50).join(' '))
        const suppressOdds = parseFloat(classifiers.find((classifierEntry) => classifierEntry?.id == 'nostr')?.thresholdSuppressOdds || '999')
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
          .map((post: any) => {
            const shortmlText = post.mlText.split(' ').slice(0, 50).join(' ')
            const newPost = {
              ...post, 
              ...{ mlText: shortmlText}
            }
            return newPost
          })
          .filter((nostrPost: any) => {
            return [processedNostrPosts]
            .flat()?.indexOf(nostrPost.mlText) == -1
          })
          .filter((postItem: {mlText: string}) => {
            return ![processedNostrPosts].flat()?.find((processedPost) => {
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
          .map((post: any) => {
            const shortmlText = post.mlText.split(' ').slice(0, 50).join(' ')
            const newPost = {
              ...post, 
              ...{ mlText: shortmlText}
            }
            return newPost
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
  const [fetchedRSSPosts, {mutate: mutateRssPosts}] = createResource(fetchRssParams, fetchRssPosts);
  const toggleNav = () => setNavIsOpen(!navIsOpen())

  // onMount(async () => {
  //   console.log("you are tiger")
  //   // const wsProvider = new WebsocketProvider('ws://localhost:1234', 'my-roomname', doc, { WebSocketPolyfill: require('ws') })
  //   // const doc = new Y.Doc();
  //   // const yarray = doc.getArray('my-array')
  //   // yarray.observe(event => {
  //   //   console.log('yarray was modified')
  //   // })
  //   // // every time a local or remote client modifies yarray, the observer is called
  //   // yarray.insert(0, ['val']) // => "yarray was modified"
  // })
  console.log(scoredRSSPosts())

  return (
    <div class='flex justify-start font-sans mr-30px'>
      <div 
        class={` bg-black overflow-visible ease-in-out duration-500 transform-translate-x  ${navIsOpen() ? 'w-200px' : 'w-0 mr-30px'}`}
      >
          <Button
              class={`sticky top-25px   ${navIsOpen() ? 'text-white' : ''}`}
              onClick={() => toggleNav()} 
              title='menu'
              label='☰'
          />
          <div class={`${navIsOpen() ? 'w-200px sticky top-20 mt-10 pb-20' : 'w-0 overflow-hidden'}`}>
            <NavBar
              toggleNav={() => toggleNav()}
              mutateRssPosts={() => {
                mutateRssPosts(()=> [])
                setDedupedRSSPosts('')
                setScoredRSSPosts('')
              }}
              setSelectedTrainLabel={(newLabel: string) => setSelectedTrainLabel(newLabel)}
              checkedTrainLabels={() => checkedTrainLabels}
            />
          </div>
      </div>
      <div class='w-auto pl-3 mr-2'>
        <Routes>
          <Route path='/cors' component={() => {
            const CorsProxies = lazy(() => import("./CorsProxies"))
            return <CorsProxies
              corsProxies={corsProxies}
              putCorsProxy={putCorsProxy}
              removeCorsProxy={removeCorsProxy}
            />
          }} />
          <Route path='/alby' component={() => {
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
              metadata={selectedMetadata()}
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
              rssPosts={dedupedRSSPosts() && JSON.parse(dedupedRSSPosts())}
            />
          }} />
          <Route path='/' component={() => {
            const RSSPosts = lazy(() => import("./RSSPosts"))
            return <RSSPosts
              trainLabel=''
              metadata={selectedMetadata()}
              setSelectedTrainLabel={() => setSelectedTrainLabel('')}
              train={(params: {
                mlText: string,
                mlClass: string,
                trainLabel: string
              }) => {
                train({
                  mlText: params.mlText,
                  mlClass: params.mlClass,
                  trainLabel: ''
                })
              }}
              markComplete={(postId: string, feedId: string) => markComplete(postId, feedId)}
              rssPosts={dedupedRSSPosts() && JSON.parse(dedupedRSSPosts())}
            />
          }} />

          <Route path='/rssposts/:trainlabel' component={() => {
            const RSSPosts = lazy(() => import("./RSSPosts"))
            const {trainlabel} = useParams()
            return <RSSPosts
              trainLabel={selectedTrainLabel() || ''}
              metadata={selectedMetadata()}
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
              rssPosts={scoredRSSPosts() && JSON.parse(scoredRSSPosts())}
              setSelectedTrainLabel={setSelectedTrainLabel}
            />
          }} />

          <Route path='/rssposts/:trainlabel/:model' component={() => {
            const RSSPosts = lazy(() => import("./RSSPosts"))
            const {trainlabel} = useParams()
            return <RSSPosts
              trainLabel={selectedTrainLabel() || ''}
              metadata={selectedMetadata()}
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
              rssPosts={scoredRSSPosts() && JSON.parse(scoredRSSPosts())}
              setSelectedTrainLabel={setSelectedTrainLabel}
            />
          }} />
          <Route path='/prompt/:trainlabel' component={() => {
            return <Prompt
              rssPosts={scoredRSSPosts() && JSON.parse(scoredRSSPosts())}
              setSelectedTrainLabel={setSelectedTrainLabel}
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
                  putNostrKey={putNostrKey}
                  putProcessedPost={putProcessedPost}
                  putClassifier={putClassifier}
                  markComplete={(postId: string) => markComplete(postId, 'nostr')}
                />
              )
            }}
          />
          <Route path='/contact' component={() => <Contact/>} />
          <Route path='/subscriptions' component={() => <Payment />} />
          <Route path='/nostrrelays' component={() => {
            return <NostrRelays
              nostrRelays={nostrRelays}
              putNostrRelay={putNostrRelay}
              removeNostrRelay={removeNostrRelay}
              />
          }} />
          <Route path='/nostrkeys' component={() => {
            return <NostrKeys
              nostrKeys={nostrKeys}
              putNostrKey={putNostrKey}
              removeNostrKey={removeNostrKey}
              />}} />
          <Route path='/nostrkeys/raw' component={() => <pre>{JSON.stringify(nostrKeys, null, 2)}</pre>}/>

          <Route path='/classifiers' component={() => {
            return <Classifiers
              classifiers={classifiers}
              putClassifier={putClassifier}
              removeClassifier={removeClassifier}
              />}}
          />
          <Route path='/classifiers/:trainLabel' component={() => {
            return <Classifiers
              classifiers={classifiers}
              putClassifier={putClassifier}
              removeClassifier={removeClassifier}
              />}}
          />

          <Route path='/classifiers/raw' component={() => {
            return <pre>
              {JSON.stringify(classifiers, null, 2)}
              </pre>
            }}/>
          <Route path='/trainlabels' component={() => {
            return <TrainLabels
              trainLabels={trainLabels}
              putTrainLabel={putTrainLabel}
              removeTrainLabel={removeTrainLabel}
              />}} />
        </Routes>
      </div>
    </div>
  )
};
export default App;
import {
  Show,
  For,
  createSignal
} from 'solid-js';
import {
  Link,
  Collapsible,
  Separator
} from "@kobalte/core";
import { Button } from './components/Button'
import { PageHeader } from './components/PageHeader'
import { SkeletonPost } from './components/SkeletonPost'

import PostTrain from './PostTrain'
import { IoRemoveCircleOutline } from 'solid-icons/io'
import { NostrKey } from './NostrKeys'
import { nip19 } from 'nostr-tools'

const NostrPosts = (props: {
  selectedTrainLabel: any,
  train: any,
  nostrPosts: any,
  putNostrKey: any,
  putClassifier: any,
  markComplete: any
}) => {
  
  const handleIgnore = (publicKey: string) => {
    const newNostrKey: NostrKey = {
      publicKey: publicKey,
      secretKey:'',
      label:'',
      follow: false,
      ignore: true
    }
    props.putNostrKey(newNostrKey)
  }

  const removeLinks = (text: string) => {
    return text.replace(/((http|https|ftp|trojan):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '')
    .replace(/nostr:.*/g, '')
    .replace(/note1.*/g, '')
    .replace(/data:image.*/g, '')
    .replace('undefined', '')
  }

  const [processedPostsForSession, setProcessedPostsForSession] = createSignal('')

  return (
    <main>
      <PageHeader>Nostr Global</PageHeader>
      <For
        each={props.nostrPosts()}
        fallback={<div><SkeletonPost /><SkeletonPost /></div> }
      >
        {(post) => {
          const [visible, setVisible] = createSignal(true)
          return (
            <Show when={post.mlText != '' && visible() == true}>
                {
                  <Collapsible.Root defaultOpen={!processedPostsForSession().includes(post.mlText)}>
                    <Collapsible.Content class="collapsible__content pr-5">
                      <div class='flex flex-row'>
                        <Button
                          label={<IoRemoveCircleOutline />}
                          title='ignore author'
                          onClick={() => {
                            handleIgnore(post.pubkey)
                            setVisible(false)
                            setTimeout(() => {
                              props.markComplete(post.mlText)
                            }, 300)
                          }}
                        />
                        <div>{`${nip19.npubEncode(post.pubkey).slice(0, 20)}...`}</div>
                      </div>
                      <div>
                        <span style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</span>
                        <span class='ml-4'>
                          {`${(0.0 + post.prediction['promote'] || 0.0)
                          .toFixed(2)
                          .replace('NaN', '-')}`}
                        </span>
                        <span>
                          <Link.Root target='_blank' href={`https://iris.to/${nip19.npubEncode(post.pubkey)}`}><div class='ml-4'>iris.to</div></Link.Root>
                        </span>
                        <span>
                          <Link.Root target='_blank' href={`https://astral.ninja/${nip19.npubEncode(post.pubkey)}`}><div class='ml-4'>astral.ninja</div></Link.Root>
                        </span>
                        <span>
                          <Link.Root target='_blank' href={`https://njump.me/${nip19.npubEncode(post.pubkey)}`}><div class='ml-4'>njump.me</div></Link.Root>
                        </span>
                      </div>
                      <div class='flex text-wrap pr-3 break-words'>
                        {
                          removeLinks(post.content)
                        }
                      </div>
                      <For each={post.links} fallback={<></>}>
                        {(link) => {
                          return (
                            <div>
                              <Link.Root href={link} target='cafe-society'>
                                {
                                  link.length >= 35 ? `${link.substring(0,35)}...` : link
                                }
                              </Link.Root>
                            </div>
                          )
                        }}
                      </For>
                      <Collapsible.Trigger class="collapsible__trigger bg-white border-none">
                          <PostTrain
                            trainLabel={'nostr'}
                            train={(mlClass: string) => {
                              props.train({
                                mlClass: mlClass,
                                mlText: post.mlText
                              })
                            }}
                            mlText={post.mlText}
                            prediction={post.prediction}
                            docCount={post.docCount}
                            markComplete={() => {
                              setProcessedPostsForSession(processedPostsForSession().concat(post.mlText))
                              props.markComplete(post.mlText)
                            }}
                          />
                      </Collapsible.Trigger>
                      <Separator.Root />
                    </Collapsible.Content>
                  </Collapsible.Root>  
                }
              </Show>
          )
        }}
      </For>
    </main>
  )
}
export default NostrPosts;
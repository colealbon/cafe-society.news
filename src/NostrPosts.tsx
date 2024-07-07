import {
  Show,
  For,
  createSignal
} from 'solid-js';
import {
  Link,
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

  const truncateLongWords = (text: String) => {
    return text.split(" ").map(word => word.slice(0, 30)).join(' ')
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
          const contentWithoutLinks = removeLinks(post.content)
          return (
            <Show when={post.mlText != '' && visible() == true}>
              <Show when={!processedPostsForSession().includes(post.mlText)}>
                <div class='flex flex-row'>
                  <Button
                    class='ml-2 pl-0'
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
                <div style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</div>
                <div class='flex flex-row'>
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
                <article class='text-xl pr-4'>
                  {
                    truncateLongWords(contentWithoutLinks)
                  }
                </article>
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
                <Separator.Root></Separator.Root>
              </Show>
            </Show>
          )
        }}
      </For>
    </main>
  )
}
export default NostrPosts;
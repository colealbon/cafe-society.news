import {
  Show,
  For
} from 'solid-js';
import {
  Separator,
  Link,
  Collapsible
} from "@kobalte/core";
import { Button } from './components/Button'

import PostTrain from './PostTrain'
import { IoRemoveCircleOutline } from 'solid-icons/io'
import { NostrKey } from "./db-fixture";
import { nip19 } from 'nostr-tools'

const NostrPosts = (props: {
  selectedTrainLabel: any,
  train: any,
  nostrPosts: any,
  selectedNostrAuthor: any,
  setSelectedNostrAuthor:any,
  putNostrKey: any,
  putClassifier: any,
  putProcessedPost: any,
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
    return text.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '')
    .replace(/nostr:.*/g, '')
    .replace(/note1.*/g, '')
    .replace('undefined', '')
  }
  return (
    <main>
      <div class="bg-white sticky top-0 uppercase w-auto flex justify-center">
        <h1>nostr global feed</h1>
      </div>
      <Separator.Root />
      <For
        each={props.nostrPosts()}
        fallback={
          <div>
            <div class='fade-in'>LOADING</div>
            <div class='fade-in-slow'>for speed, try running your own <Link.Root href='https://github.com/aljazceru/awesome-nostr'>nostr</Link.Root> relay</div>
          </div>
        }
      >
        {(post) => {
          return (
            <Show when={post.mlText != ''}>
              <Show when={() => props.nostrPosts().map((post: any) => post.mlText).indexOf(post.mlText) != -1}>
                {
                  <Collapsible.Root defaultOpen={true}>
                    <Collapsible.Content class="collapsible__content">
                      <Show when={(props.selectedNostrAuthor() == '')}>
                        <Collapsible.Trigger class="collapsible__trigger bg-white border-none">
                          <Button
                            label='ignore author'
                            title='ignore author'
                            onClick={() => {
                              handleIgnore(post.pubkey)
                              setTimeout(() => {
                                props.markComplete(post.mlText)
                                props.setSelectedNostrAuthor('')
                              }, 300)
                            }}
                          >
                            <div class='mt-2 fade-in'>
                              <IoRemoveCircleOutline />
                            </div>
                          </Button>
                        </Collapsible.Trigger>
                      </Show>
                      <div>{`${nip19.npubEncode(post.pubkey).slice(0, 20)}...`}</div>
                      <div class="fade-in">
                        <span style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</span>
                        <span class='ml-4'>
                          {`${(0.0 + post.prediction['promote'] || 0.0)
                          .toFixed(2)
                          .replace('NaN', '-')}`}
                        </span>
                        <span>
                          <Link.Root target='_blank' href={`https://iris.to/${nip19.npubEncode(post.pubkey)}`}><div class='fade-in ml-4'>iris.to</div></Link.Root>
                        </span>
                        <span>
                          <Link.Root target='_blank' href={`https://astral.ninja/${nip19.npubEncode(post.pubkey)}`}><div class='fade-in ml-4'>astral.ninja</div></Link.Root>
                        </span>
                      </div>
                      <Separator.Root class='ml-2 max-w-lg'/>
                      <div class='flex text-wrap w-full max-w-lg fade-in'>
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
                            props.markComplete(post.mlText)
                          }}
                        />
                      </Collapsible.Trigger>
                      <Separator.Root class='ml-2 max-w-lg'/>
                    </Collapsible.Content>
                  </Collapsible.Root>  
                }
              </Show>
            </Show>
          )
        }}
      </For>
    </main>
  )
}
export default NostrPosts;
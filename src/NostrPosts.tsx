import {
  Show,
  For
} from 'solid-js';
import {
  Separator,
  Link,
  Button,
  Collapsible
} from "@kobalte/core";

import PostTrain from './PostTrain'
import { CgUserAdd } from 'solid-icons/cg'
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
  const handleClickDrillPubkey = (publicKey: string) => {
    props.setSelectedNostrAuthor(publicKey)
  }

  const handleFollow = (publicKey: string) => {
    const newNostrKey: NostrKey = {
      publicKey: publicKey,
      secretKey:'',
      label:'',
      follow: true,
      ignore: false
    }
    props.putNostrKey(newNostrKey)
  }

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
      <div>
        <h1>nostr global feed</h1>
        <Separator.Root />
      </div>
      <Show when={props.selectedNostrAuthor() !== ''}>
        <div class='flex flex-row m-0 p-0'>
          <Button.Root
            class='bg-transparent border-none rounded'
            onClick={(event) => {
              event.preventDefault()
              handleClickDrillPubkey('')
            }}
            title='nostr global feed'
          >
            <div class='text-xl text-orange hover-bg-orange hover-text-white text-xl rounded-2 ml-1 mr-1'>
             {` ${props.selectedNostrAuthor().substring(0,5)}...${props.selectedNostrAuthor().substring(props.selectedNostrAuthor().length - 5)} `}
            </div>
          </Button.Root>
          <Button.Root
            title='follow'
            class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-green-900 rounded-full`}
            onClick={event => {
              event.preventDefault()
              handleFollow(props.selectedNostrAuthor())
              props.setSelectedNostrAuthor('')
            }}
          >
            <div class='text-green-900 hover-text-white mt-1'>
              <CgUserAdd />
            </div>
           </Button.Root>

           <Button.Root
            title='ignore'
            class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red rounded-full`}
            onClick={event => {
              event.preventDefault()
              handleIgnore(props.selectedNostrAuthor())
              props.setSelectedNostrAuthor('')
            }}
          >
            <div class='text-red hover-text-white mt-2'>
              <IoRemoveCircleOutline />
            </div>
           </Button.Root>
          <div />
          <div />
          <div />
          <div />
        </div>
        <Separator.Root class="separator" />
      </Show>
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
                          <Button.Root
                            title='ignore author'
                            class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-red rounded-full fade-in`}
                            onClick={event => {
                              event.preventDefault()
                              handleIgnore(post.pubkey)
                              setTimeout(() => {
                                props.markComplete(post.mlText)
                                props.setSelectedNostrAuthor('')
                              }, 300)
                            }}
                          >
                            <div class='text-red hover-text-white mt-2 fade-in'>
                              <IoRemoveCircleOutline />
                            </div>
                          </Button.Root>
                        </Collapsible.Trigger>
                      </Show>
                      <div>{`${nip19.npubEncode(post.pubkey)}`}</div>
                      <div flex flex-row class="fade-in">
                        <div style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</div>
                        <div class='ml-4'>
                          {`promote odds: ${(0.0 + post.prediction['promote'] || 0.0)
                          .toFixed(2)
                          .replace('NaN', '-')}`}
                        </div>
                        <Link.Root target='_blank' href={`https://iris.to/${nip19.npubEncode(post.pubkey)}`}><div class='fade-in ml-4'>iris.to</div></Link.Root>
                        <Link.Root target='_blank' href={`https://astral.ninja/${nip19.npubEncode(post.pubkey)}`}><div class='fade-in ml-4'>astral.ninja</div></Link.Root>
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
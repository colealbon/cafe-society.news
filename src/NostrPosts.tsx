import {
  Show,
  For
} from 'solid-js';
import {
  Separator,
  Link,
  Collapsible,
  Button,
  Tooltip
} from "@kobalte/core";

import PostTrain from './PostTrain'
import { CgUserAdd } from 'solid-icons/cg'
import { IoRemoveCircleOutline } from 'solid-icons/io'
import { NostrKey } from "./db-fixture";

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

  return (
    <main>
      <div class="fade-in">
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
      <For each={props.nostrPosts()} fallback={<>Loading</>}>
          {(post) => {
            return (
              <Show when={post.mlText != ''}>
              {
                <Collapsible.Root class="collapsible border-none w-full m-0 p-0" defaultOpen={true}>
                  <Collapsible.Content class="flex text-wrap w-full mt-4 ml-0 p-0">
                    <p class="w-full m-0 p-0">
                    {
                      <div class='w-full m-0 p-0'>
                        <Show when={(props.selectedNostrAuthor() == '')}>
                          <Button.Root
                            class='bg-transparent border-none rounded'
                            onClick={(event) => {
                              event.preventDefault()
                              handleClickDrillPubkey(post.pubkey)
                            }}
                            title='view user posts'
                          >
                            <div class='text-xl text-orange hover-bg-orange hover-text-white text-xl rounded-2 ml-1 mr-1'>
                            {`${post.pubkey.substring(0,5)}...${post.pubkey.substring(post.pubkey.length - 5)}`}
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
                        </Show>
                        <div style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</div>
                        <div class='flex text-wrap w-full'>
                          {
                            post.content
                            .replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '')
                            .replace(/nostr:.*/g, '')
                            .replace('undefined', '')
                          }
                        </div>
                        <For each={post.links} fallback={<></>}>
                          {(link) => {
                            return (
                              <div>
                                <Link.Root href={link} target='cafe-society'>{link.length >= 35 ? `${link.substring(0,35)}...` : link }</Link.Root>
                              </div>
                            )
                          }}
                        </For>
                        <Collapsible.Trigger class='bg-transparent border-none'>
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
                            markComplete={() => props.markComplete(post.mlText)}
                          />
                      </Collapsible.Trigger>
                    </div>}
                </p>
              </Collapsible.Content>
            </Collapsible.Root>
          }</Show>
            )
          }}
        </For>
    </main>
  )
}
export default NostrPosts;
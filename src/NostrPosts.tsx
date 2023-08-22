import {
  Show,
  For
} from 'solid-js';
import {
  Separator,
  Link,
  Collapsible
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
        <div style={{'margin': '30px', 'display': 'flex', 'flex-direction': 'row', 'justify-content': 'space-around'}}>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleClickDrillPubkey('')
          }}>
            <div color='orange'>
             {`${props.selectedNostrAuthor()}`}
            </div>
          </Link.Root>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleFollow(props.selectedNostrAuthor())
            props.setSelectedNostrAuthor('')
          }}>
            <div color='green'>
            <CgUserAdd/>
            </div>
          </Link.Root>
          <Link.Root onClick={(event) => {
            event.preventDefault()
            handleIgnore(props.selectedNostrAuthor())
            props.setSelectedNostrAuthor('')
          }}>
            <div color='red'>
            <IoRemoveCircleOutline />
            </div>
          </Link.Root>
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
                <Collapsible.Root class="collapsible" defaultOpen={true}>
                  <Collapsible.Content class="collapsible__content">
                    <p class="collapsible__content-text">
                    {
                      <>
                        <Link.Root
                          style={{'color': 'orange'}}
                          onClick={(event) => {
                          event.preventDefault()
                          handleClickDrillPubkey(post.pubkey)
                        }}>
                          {`${post.pubkey.substring(0,5)}...${post.pubkey.substring(post.pubkey.length - 5)}`}
                        </Link.Root>
                        <Link.Root onClick={(event) => {
                          event.preventDefault()
                          handleIgnore(post.pubkey)
                        }}>
                          <IoRemoveCircleOutline />
                        </Link.Root>

                        <div style={{'color': 'grey'}}>{`${parseInt((((Date.now() / 1000) - parseFloat(post.created_at)) / 60).toString())} minutes ago`}</div>
                        <div>
                          {post.content}
                        </div>
                        <Collapsible.Trigger class="collapsible__trigger">
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
                    </>}
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
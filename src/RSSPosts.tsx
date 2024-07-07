import {
  For,
  Show,
  createEffect,
  createSignal
} from 'solid-js'
import {
  useParams
} from '@solidjs/router'
import {
  Title
  ,Meta 
} from "@solidjs/meta";
import {PageHeader} from './components/PageHeader'
import PostDisplay from './PostDisplay'
import PostTrain from './PostTrain'

import { Collapsible } from "@kobalte/core/collapsible"
import {
  SkeletonPost
} from './components/SkeletonPost'

import {
  shortUrl,
  shortGuid
} from './util'

const Posts = (props: {
  trainLabel: string,
  metadata: {
    description: string, 
    title: string, 
    keywords: string
  },
  train?: any,
  rssPosts: any,
  markComplete: any,
  setSelectedTrainLabel: any,
}) => {
  const [processedPostsForSession, setProcessedPostsForSession] = createSignal('')
  createEffect(() => {
    try {
      if (`${useParams().trainlabel}` === 'undefined') {
        props.setSelectedTrainLabel('')
        return
      }
      props.setSelectedTrainLabel(`${useParams().trainlabel}`)
    } catch (error) {
      console.log(error)
      return
    }
  })

  return (
    <>
      <Title>{`cafe-society.news - ${props.trainLabel}`}</Title>
      <Meta name="description" content={`${props.metadata?.description}`} />
      <Meta name="title" content={props.metadata?.title} />
      <Meta name="keywords" content={props.metadata?.keywords} />
      <PageHeader>{props.trainLabel || 'all rss posts'}</PageHeader>
      <For each={props.rssPosts} fallback={<div class="pl-6"><SkeletonPost /> <SkeletonPost /> </div>}>
        {(post) => {
          const [isShrinking, setIsShrinking] = createSignal(false);
          const processedPostsID = `${post.feedLink}` === "" ? shortGuid(post.guid) : shortUrl(`${post.feedLink}`)
          return (
            <Collapsible class="collapsible" defaultOpen={!processedPostsForSession().includes(post.mlText)}>
              <Collapsible.Content class='collapsible__content pr-2'>
                <PostDisplay {...post} isShrinking={isShrinking}/>
                <Collapsible.Trigger class="collapsible__trigger bg-white border-none">
                  <Show when={props.trainLabel != ''}>
                    <div class='justify-center'>
                      <PostTrain
                        trainLabel={props.trainLabel}
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
                          setTimeout(() => {
                            props.markComplete(post.mlText, processedPostsID)
                          }, 300)
                        }}
                      />
                    </div>
                  </Show>
                </Collapsible.Trigger>
              </Collapsible.Content>
            </Collapsible>   
          )}}       
      </For>
    </>
  )
}
export default Posts;
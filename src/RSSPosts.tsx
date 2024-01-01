import {
  For,
  Show,
  createEffect
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

import {
  Collapsible
} from "@kobalte/core";
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
          const processedPostsID = `${post.feedLink}` === "" ? shortGuid(post.guid) : shortUrl(`${post.feedLink}`)
          return (
              <Collapsible.Root defaultOpen={true}>
                <Collapsible.Content class="collapsible__content pr-2 fade-in">
                  <PostDisplay {...post}/>
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
                          markComplete={() => props.markComplete(post.mlText, processedPostsID)}
                        />
                      </div>
                    </Show>
                  </Collapsible.Trigger>
                </Collapsible.Content>
              </Collapsible.Root>      
          )}}       
      </For>
    </>
  )
}
export default Posts;
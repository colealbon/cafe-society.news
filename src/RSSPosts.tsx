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
          const processedPostsID = `${post.feedLink}` === "" ? shortGuid(post.guid) : shortUrl(`${post.feedLink}`)
          return (
            <Show when={!processedPostsForSession().includes(post.mlText)}>
              <PostDisplay {...post}/>
                <Show when={props.trainLabel != ''}>
                  <div class='justify-center m-0'>
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
            </Show>
          )}}       
      </For>
    </>
  )
}
export default Posts;
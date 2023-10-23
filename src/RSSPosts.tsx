import {
  For,
  Show
} from 'solid-js'
import {PageHeader} from './components/PageHeader'
import PostDisplay from './PostDisplay'
import PostTrain from './PostTrain'
import {
  Collapsible,
  Skeleton
} from "@kobalte/core";

const removePunctuation = (text: string) => {
  return `${text}`
    .replace(/[/?…".,#!$%^&*;:{}=_`~()'’‘“”]/g, '')
    .replace(/\s{2,}/g, ' ');
};

export const shortUrl = (text: string) => {
  const theUrl = new URL(text);
  const newPath = removePunctuation(`${theUrl.hostname}${theUrl.pathname}`)
    .replace(/-/g, '')
    .toLowerCase();
  return newPath;
};

const Posts = (props: {
  trainLabel: string,
  train: any,
  rssPosts: any,
  markComplete: any
}) => {
  return (
    <div>
      <PageHeader>{props.trainLabel || 'all rss posts'}</PageHeader>
      <For each={props.rssPosts?.flat()} fallback={<Skeleton.Root class="skeleton pl-5"  height={50} radius={10} /> }>
        {(post) => {
          const shortGuid = (input: string) => {
            try {
              const newShortGuid = shortUrl(post.guid.replace(/\?.*$/,''))
              return newShortGuid
            } catch (error) {
              return post.guid.replace(/\?.*$/,'')
            }
          }
          const processedPostsID = post.feedLink === "" ? shortGuid(post.guid) : shortUrl(post.feedLink)
          return (
            <Collapsible.Root defaultOpen={true}>
              <Collapsible.Content class="collapsible__content">
                <PostDisplay {...post}/>
                <Collapsible.Trigger class="collapsible__trigger bg-white border-none">
                  <Show when={props.trainLabel != ''}>
                    <div class='justify-center'>
                      <PostTrain
                        trainLabel={props.trainLabel}
                        train={(mlClass: string) => {
                          setTimeout(() => {
                            props.train({
                              mlClass: mlClass,
                              mlText: post.mlText
                            })
                          }, 300)
  
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
    </div>
  )
}
export default Posts;
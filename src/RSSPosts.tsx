import {
  For,
  Show
} from 'solid-js'
import PostDisplay from './PostDisplay'
import PostTrain from './PostTrain'
import { Collapsible } from "@kobalte/core";

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
  setSelectedTrainLabel: any,
  train: any,
  rssPosts: any,
  markComplete: any
}) => {
  return (
    <div>
      <h1>{props.trainLabel || 'posts'}</h1>
      <For each={props.rssPosts?.flat()} fallback={
        <div>
          <div class='fade-in'>LOADING</div>
          <div class='fade-in-slow'>try setting up <a href='https://www.npmjs.com/package/cors-anywhere'>cors proxy</a> and add it to the cors proxies settings</div>
        </div>
      }>
        {(post) => {
          const processedPostsID = post.feedLink === "" ? post.guid : shortUrl(post.feedLink)
          return (
            <Collapsible.Root defaultOpen={true}>
              <Collapsible.Content class="collapsible__content">
                <PostDisplay {...post}/>
                <Collapsible.Trigger class="collapsible__trigger bg-white border-none">
                  <Show when={props.trainLabel != ''}>
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
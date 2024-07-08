import {
  Component
} from 'solid-js';

const PostDisplay = (props: {
  postTitle: string;
  postSummary: string;
  postId: string;
}) => {
  const truncateLongWords = (text: String) => {
    return text.split(" ").map(word => word.slice(0, 30)).join(' ')
  }
  return(
    <div>
      <h2>
        <a target="cafe" rel="noreferrer noopener" href={props.postId}>{
          truncateLongWords(props.postTitle)
        }</a>
      </h2>
      <article class='text-xl pr-4'>
        {truncateLongWords(props.postSummary)}
      </article>
  </div>
  )
}
export default PostDisplay
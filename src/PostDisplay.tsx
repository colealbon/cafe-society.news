import {
  Component
} from 'solid-js';

const PostDisplay = (props: {
  postTitle: string;
  postSummary: string;
  postId: string;
}) => {
  return(
    <div class='bg-white fade-in'>
      <h2 class=' bg-white pr-2'>
        <a target="cafe" rel="noreferrer noopener" href={props.postId}>{
          props.postTitle
        }</a>
      </h2>
      <div class='bg-white pr-2 break-words'>
        {props.postSummary}
      </div>
  </div>
  )
}
export default PostDisplay
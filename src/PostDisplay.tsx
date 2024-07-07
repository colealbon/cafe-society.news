import {
  Component
} from 'solid-js';

const PostDisplay = (props: {
  postTitle: string;
  postSummary: string;
  postId: string;
  isShrinking: any;
}) => {
  return(
    <div>
      <h2>
        <a target="cafe" rel="noreferrer noopener" href={props.postId}>{
          props.postTitle
        }</a>
      </h2>
      <div class='break-word block'>
        {props.postSummary}
      </div>
  </div>
  )
}
export default PostDisplay
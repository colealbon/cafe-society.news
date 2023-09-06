import {
  Component
} from 'solid-js';

const PostDisplay: Component = (props: {
  postTitle: string;
  postSummary: string;
  postId: string;
}) => {
  return(
    <div class='bg-white bg-opacity-100'>
      <h2 class='color-blue-700 bg-white bg-opacity-100'>
        <a target="cafe" rel="noreferrer noopener" href={props.postId}>{
          props.postTitle
        }</a>
      </h2>
      <div class='bg-white bg-opacity-100'>
        {props.postSummary}
      </div>
  </div>
  )
}
export default PostDisplay
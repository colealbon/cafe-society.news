import {
  Show
} from 'solid-js'
import {
  Tooltip
} from "@kobalte/core";
import {Button} from './components/Button';

const PostTrain = (props: {
  mlText: string,
  trainLabel: string,
  prediction: any,
  docCount: number,
  markComplete: () => any,
  // eslint-disable-next-line no-unused-vars
  train: (mlClass: string) => any
}) => {
  // const handleComplete = () => props.markComplete( )
  const handleTrain = (mlClass: string) => {
    props.train(mlClass)
  }
  const handleComplete = () => {
      props.markComplete()    
  }

  return(
    <div class='bg-transparent bg-red border-none'>
      <Button 
        label='↓'
        onClick={() => {
          // setTimeout(() => {
            handleComplete()
            handleTrain('suppress')
          // }, 300)
        }}
      />
      <Tooltip.Root>
        <Tooltip.Trigger class='tooltip__trogger border-none p-o bg-transparent'>
          <Button label={`${(0.0 + (props.prediction && props.prediction['promote']) || 0.0).toFixed(2).replace('NaN', '-')}`} onClick={() => handleComplete()} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content class="tooltip__content p-0">
            <pre>
              <div>
                {props.docCount ? `ML document count: ${props.docCount}` : `more training required for predictions ${JSON.stringify(props.prediction, null, 2)}`}
              </div>
              <div>
                {`prediction: ${(0.0 + props.prediction['promote'] || 0.0) > 0 ? 'promote' : 'suppress'} ${(0.0 + props.prediction['promote'] || 0.0)
                .toFixed(2)
                .replace('NaN', '-')}`}
              </div>
            </pre>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Button
        label='↑'
        onClick={() => {
          // setTimeout(() => {
            handleComplete()
            handleTrain('promote')
          // }, 300)
        }} />
    </div>
  )
}
export default PostTrain
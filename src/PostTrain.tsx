import {
  Show
} from 'solid-js'
import {
  Tooltip,
  Separator
} from "@kobalte/core";
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'solid-icons/ai'
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
    <div class='flex flex-row flex-around flex-items-center bg-white border-none'>
      <Show when={(0.0 + props.prediction['suppress'] || 0.0) > 0}>
        {(0.0 + props.prediction['suppress'] || 0.0).toFixed(2)}
      </Show>
      <Button 
        label='↓'
        onClick={() => {
          handleComplete()
          handleTrain('suppress')
        }}
      />
    <Tooltip.Root>
      <Tooltip.Trigger class=' bg-white border-none'>
        <Button label={props.trainLabel} onClick={() => handleComplete()} />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="tooltip__content">
          <div>
            <div>
              {props.docCount ? `ML document count: ${props.docCount}` : `more training required for predictions ${JSON.stringify(props.prediction, null, 2)}`}
            </div>
            <div>
              {`prediction: ${(0.0 + props.prediction['promote'] || 0.0) > 0 ? 'promote' : 'suppress'}`}
            </div>
            <div>
              {`odds: ${(0.0 + props.prediction['promote'] || 0.0)
              .toFixed(2)
              .replace('NaN', '-')}`}
            </div>
            <div>
              {`mltext: ${props.mlText}`}
            </div>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
      <Button
        label='↑'
        onClick={() => {
          handleComplete()
          handleTrain('promote')
        }} />
      <div/>
      <div/>
      <Separator.Root />
    </div>

  )
}
export default PostTrain
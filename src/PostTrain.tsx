import {
  Show
} from 'solid-js'
import { Button } from "@kobalte/core";
import { Tooltip } from "@kobalte/core";
import {
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'solid-icons/ai'

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

  return(
    <div class='flex flex-row flex-around flex-items-center'>
      <Show when={(0.0 + props.prediction['suppress'] || 0.0) > 0}>
        {(0.0 + props.prediction['suppress'] || 0.0).toFixed(2)}
      </Show>
      <AiOutlineArrowDown
        class={`text-4xl transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full`}
        onclick={() => setTimeout(() => {
          props.markComplete()
          handleTrain('suppress')
        }, 300)
      }/>
    <Tooltip.Root>
      <Tooltip.Trigger class='p-0 bg-transparent border-none'>
        <Button.Root
          onClick={() => setTimeout(() => props.markComplete() , 300)}
          class={`text-xl transition-all bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full`}
        >
          {props.trainLabel}
        </Button.Root>
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
    <div class='rounded-full hover-text-white mt-1'>
      <AiOutlineArrowUp
        class="text-4xl transition-all text-transparent bg-transparent border-none hover-text-white hover:bg-slate-400 rounded-full"
        onclick={() => setTimeout(() => {
            props.markComplete()
            handleTrain('promote')
          }, 300)
      }/>
    </div>
      <div/>
      <div/>
    </div>
  )
}
export default PostTrain
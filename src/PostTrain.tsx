import {
  Show
} from 'solid-js'
import {
  Button,
  Tooltip,
  Separator
} from "@kobalte/core";
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
  const handleComplete = () => {
    props.markComplete()
  }

  return(
    <div class='flex flex-row flex-around flex-items-center bg-white border-none'>
      <Show when={(0.0 + props.prediction['suppress'] || 0.0) > 0}>
        {(0.0 + props.prediction['suppress'] || 0.0).toFixed(2)}
      </Show>
      <AiOutlineArrowDown
        class={`text-4xl transition-all bg-white border-none hover-text-white hover:bg-slate-400 rounded-full`}
        onclick={() => {
          handleComplete()
          handleTrain('suppress')
        }}
      />
    <Tooltip.Root>
      <Tooltip.Trigger class='p-0 bg-white border-none'>
        <Button.Root
          onClick={() => handleComplete()}
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
        class="border-none text-4xl transition-all text-transparent bg-white border-none hover-text-white hover:bg-slate-400 rounded-full"
        onclick={() => {
          handleComplete()
          handleTrain('promote')
        }}
      />
    </div>
      <div/>
      <div/>
      <Separator.Root />
    </div>

  )
}
export default PostTrain
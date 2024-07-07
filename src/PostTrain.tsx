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
    props.markComplete()
  }
  const handleComplete = () => setTimeout(() => props.markComplete(), 300)
  
  return(
    <div class='bg-transparent border-none overflow-scroll'>
      <Button 
        class='ml-0 pl-0'
        label='↓'
        onClick={() => handleTrain('suppress')}
      />
      <Button 
        class='text-xl text-center ml-0 mr-0 pl-3 pr-3'
        label={`${(0.0 + (props.prediction && props.prediction['promote']) || 0.0).toFixed(2).replace('NaN', '-')}`} 
        onClick={() => handleComplete()}
      />
      <Button
        class='mr-0 pr-0'
        label='↑'
        onClick={() => handleTrain('promote')} 
      />
    </div>
  )
}
export default PostTrain
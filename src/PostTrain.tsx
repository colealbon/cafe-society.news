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
  const handleComplete = () => {
      props.markComplete()    
  }

  return(
    <div class='bg-transparent bg-red border-none'>
      <Button 
        label='↓'
        onClick={() => handleTrain('suppress')}
      />
      <Button 
        label={`${(0.0 + (props.prediction && props.prediction['promote']) || 0.0).toFixed(2).replace('NaN', '-')}`} 
        onClick={() => handleComplete()}
      />
      <Button
        label='↑'
        onClick={() => handleTrain('promote')} 
      />
    </div>
  )
}
export default PostTrain
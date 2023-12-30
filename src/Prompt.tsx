import {
  createEffect,
  createSignal,
} from 'solid-js'
import {
  useParams
} from '@solidjs/router'
import {
  SkeletonPost
} from './components/SkeletonPost'

const Prompt = (props: {
  rssPosts: any,
  setSelectedTrainLabel: any,
}) => {
  const [promptContent, setPromptContent] = createSignal('');
  createEffect(() => {
    try {
      if (`${useParams().trainlabel}` === 'undefined') {
        props.setSelectedTrainLabel('')
        return
      }
      props.setSelectedTrainLabel(`${useParams().trainlabel}`)
    } catch (error) {
      console.log(error)
      return
    }
  })
  createEffect(() => {
    const newPromptContent: string = `
SEO stands for Search Engine Optimization.
You are an expert in Search Engine Optimization.
Create SEO optimized description, title and keywords metatag for a web page that contains the content below.
The first line of the content below is not the title and is not more or less important than the rest of the content.
The description metatag should be less than 300 characters and more than 100 characters.
${props.rssPosts && props.rssPosts?.flat().map((post: any) => {
      return `${post.postTitle}
${post.postSummary}`
    }).join(`
`) }
`
    setPromptContent(newPromptContent)
  })

  return (
    <pre>
      {promptContent()}
    </pre>
  )
}
export default Prompt;
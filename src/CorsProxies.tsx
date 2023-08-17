import type { Component } from 'solid-js';
import { Separator, Link, Switch } from "@kobalte/core";
import { CorsProxy } from './db-fixture'
import { For } from 'solid-js'
import {
  createFormGroup,
  createFormControl,
} from "solid-forms";
import TextInput from './TextInput'
import {
  VsTrash
} from 'solid-icons/vs'

const CorsProxies = (props: {
    corsProxies: CorsProxy[],
    // eslint-disable-next-line no-unused-vars
    putCorsProxy: (corsProxy: CorsProxy) => void,
    // eslint-disable-next-line no-unused-vars
    removeCorsProxy: (corsProxy: CorsProxy) => void
  }) => {
    const group = createFormGroup({
      id: createFormControl(""),
      checked: createFormControl(true)
    });
  
    const onSubmit = async (event: any) => {
      event.preventDefault()
      if (group.isSubmitted) {
        // console.log('already submitted')
        return;
      }
      [Object.fromEntries(
        Object.entries(Object.assign({
          id:'',
          checked:true
        }, group.value))
        .filter(([, value]) => `${value}` !== '')
      )]
      .forEach(newCorsProxy => {
        const newCorsProxyObj: CorsProxy = {
          ...{
            id: '',
            checked: true
          },
          ...newCorsProxy
        }
        props.putCorsProxy(newCorsProxyObj)
      })
  
      group.setValue({
        id:'',
        checked:true
      })
    };
  
    const handleKeyClick = (id: string) => {
      const valuesForSelectedFeed = props.corsProxies
        .find(corsProxyEdit => corsProxyEdit['id'] === id)
      group.setValue(Object.assign({
          id:'',
          checked:true
        }, valuesForSelectedFeed))
    }
  
    const handleToggleChecked = (id: string) => {
      const valuesForSelectedFeed = props.corsProxies
      .find(corsProxyEdit => corsProxyEdit['id'] === id)
      const newValueObj = (Object.assign(
        {
          ...valuesForSelectedFeed
        },
        {checked: !group.value.checked}
      ))
      group.setValue (newValueObj)
      props.putCorsProxy(newValueObj)
      return
    }
  
    // const handleEraseClick = () => {
    //   group.setValue({
    //       id:'',
    //       checked:true
    //     })
    // }

  return (
    <div>
      <h1>Cors Proxies</h1>
      <Separator.Root />
      <main>
        <div>
          <form onSubmit={onSubmit}>
            <label for="id">URL</label>
            <TextInput name="id" control={group.controls.id} />
            <div />
            <Switch.Root
              checked={group.value.checked}
              name="checked"
              onChange={handleToggleChecked(group.value.id)}
            />
          </form>
        </div>
        <div>
          <h4 class="text-muted">Cors Proxies:</h4>
          <For each={props.corsProxies}>
            {(corsProxy) => (
              <div style={{
                'width': '100%',
                'display': 'flex',
                'flex-direction': 'row',
                'justify-content': 'flex-start',
                'font-size': '25px',
              }}>
                <div style={{
                  'padding': '8px 8px 8px 32px',
                  'text-decoration': 'none',
                  'color': '#818181',
                  'display': 'block',
                  'transition':'0.3s'
                }}>
                  <Link.Root onClick={(event) => {
                    event.preventDefault()
                    props.removeCorsProxy(corsProxy)
                  }}>
                    <VsTrash />
                  </Link.Root>
                </div>
                <div style={{
                  'padding': '8px 8px 8px 32px',
                  'text-decoration': 'none',
                  'font-size': '25px',
                  'color': '#818181',
                  'display': 'block',
                  'transition':'0.3s'
                }}>
                  <Link.Root
                    // eslint-disable-next-line solid/reactivity
                    onClick={(event) => {
                      event.preventDefault()
                      handleKeyClick(corsProxy.id)
                    }}
                  >
                    {corsProxy.id}
                  </Link.Root>
                </div>
              </div>
            )}
          </For>
        </div>
      </main>
    </div>
  )
}
export default CorsProxies;
import {
  For,
  Show,
} from 'solid-js';
import { Component, mergeProps, splitProps } from 'solid-js';
import {Button} from './Button';
import {NavLink} from './NavLink';

export interface NavBarProps {
  navIsOpen: () => boolean,
  toggleNav: () => void,
  mutateRssPosts: () => void,
  setNavIsOpen: (newState: boolean) => void,
  setSelectedTrainLabel: (label: string) => void,
  checkedTrainLabels: () => any
}

export const NavBar: Component<NavBarProps> = (props) => {
    const handleClickNavLink = () => {
        props.setNavIsOpen(false)
        props.setSelectedTrainLabel('')
      }

  return (
      <div class={`${props.navIsOpen() ? 'bg-slate-900' : ''} rounded-2`}>
        <div class='text-2xl transition-all'>
          <Button
            label={`${props.navIsOpen() ? '≡' : '≡'}`}
            onClick={() => props.toggleNav()}
          />
        </div>
        <div class={`${props.navIsOpen() ? 'flex flex-col text-left pl-3' : 'h-0 '} transition-all`}>
          <Show when={props.navIsOpen()}>
            <NavLink href='/rssposts'
              onClick={() => {
                props.mutateRssPosts()
                handleClickNavLink()
              }}
            >
              RSS&nbsp;Posts
            </NavLink>
            <For each={props.checkedTrainLabels()}>
              {
                (trainLabel) => (
                  <div class='ml-4 hover:text-slate-900'>
                    <NavLink href={`/rssposts/${trainLabel.id}`}
                      onClick={() => {
                        props.mutateRssPosts()
                        props.setNavIsOpen(false)
                        props.setSelectedTrainLabel(trainLabel.id)
                      }} 
                    >
                      {`${trainLabel.id}`}
                    </NavLink>
                  </div>
                )
              }
            </For>
            <NavLink
              href='/rssfeeds'
              onClick={() => handleClickNavLink()}
            >
              RSS&nbsp;Feeds
            </NavLink>
            <NavLink href='/nostrposts'
              onClick={() => {
                props.setNavIsOpen(false)
                props.setSelectedTrainLabel('nostr')
              }}
            >
              Nostr&nbsp;Global&nbsp;(6&nbsp;hours)
            </NavLink>
            <NavLink href='/alby' onClick={() => handleClickNavLink()}>
              Profile
            </NavLink>
            <NavLink href='/cors'onClick={() => handleClickNavLink()}>
              Cors&nbsp;Proxies
            </NavLink>
            <NavLink href='/contact' onClick={() => handleClickNavLink()}>
              Contact
            </NavLink>
            <NavLink href='/nostrrelays' onClick={() => handleClickNavLink()}>
              Nostr&nbsp;Relays
            </NavLink>
            <NavLink href='/nostrkeys' onClick={() => handleClickNavLink()}>
              Nostr&nbsp;Keys
            </NavLink>
            <NavLink testid='classifiers' href='/classifiers' onClick={() => handleClickNavLink()}>
              Classifiers
            </NavLink>
            <NavLink href='/trainlabels' onClick={() => handleClickNavLink()}>
              Train&nbsp;Labels
            </NavLink>
          </Show>
        </div>
      </div>
      )
    }
export default NavBar;
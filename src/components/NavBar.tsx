import {
  For
} from 'solid-js';
import { Component } from 'solid-js';
import {NavLink} from './NavLink';
import {
  TrainLabel,
} from "../db-fixture";

export interface NavBarProps {
  toggleNav: () => void,
  mutateRssPosts: () => void,
  setSelectedTrainLabel: (label: string) => void,
  checkedTrainLabels: () => TrainLabel[]
}

export const NavBar: Component<NavBarProps> = (props) => {

  const handleClickNavLink = () => {
    // props.toggleNav()
    props.setSelectedTrainLabel('')
  }

  return (
    <div>
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
                    <NavLink 
                      testid={`rssposts-${trainLabel.id}-link`}
                      href={`/rssposts/${trainLabel.id}`}
                      onClick={() => {
                        props.mutateRssPosts()
                        props.toggleNav()
                        props.setSelectedTrainLabel(trainLabel.id)
                      }} 
                    >
                      {`${trainLabel.id}`}
                    </NavLink>
                  </div>
                )
              }
            </For>
            <div>
            <NavLink
              testid='rssfeeds-link'
              href='/rssfeeds'
              onClick={() => handleClickNavLink()}
            >
              RSS&nbsp;Feeds
            </NavLink>
            </div>
            <div>
            <NavLink 
              testid='nostrposts-link'
              href='/nostrposts'
              onClick={() => {
                props.toggleNav()
                props.setSelectedTrainLabel('nostr')
              }}
            >
              Nostr&nbsp;Global&nbsp;(6&nbsp;hours)
            </NavLink>
            </div>
            <div>
            <NavLink testid='alby-link' href='/alby' onClick={() => handleClickNavLink()}>
              Profile
            </NavLink>
            </div>
            <div>
            <NavLink testid='cors-link' href='/cors'onClick={() => handleClickNavLink()}>
              Cors&nbsp;Proxies
            </NavLink>
            </div>
            <div>
            <NavLink testid='contact-link' href='/contact' onClick={() => handleClickNavLink()}>
              Contact
            </NavLink>
            </div>
            <div>
            <NavLink testid='nostrrelays-link' href='/nostrrelays' onClick={() => handleClickNavLink()}>
              Nostr&nbsp;Relays
            </NavLink>
            </div>
            <div>
            <NavLink testid='nostrkeys-link' href='/nostrkeys' onClick={() => handleClickNavLink()}>
              Nostr&nbsp;Keys
            </NavLink>
            </div>
            <div>
            <NavLink testid='classifiers-link' href='/classifiers' onClick={() => handleClickNavLink()}>
              Classifiers
            </NavLink>
            </div>
            <div>
            <NavLink testid='trainlabels-link' href='/trainlabels' onClick={() => handleClickNavLink()}>
              Train&nbsp;Labels
            </NavLink>
            </div>
</div>
      )
    }
export default NavBar;
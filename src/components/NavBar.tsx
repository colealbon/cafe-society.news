import {
  For
} from 'solid-js';
import { Component } from 'solid-js';
import { Collapsible } from "@kobalte/core/collapsible";
import {NavLink} from './NavLink';
import {
  TrainLabel,
} from "../db-fixture";
import { NavigationMenu } from "@kobalte/core/navigation-menu";

export interface NavBarProps {
  toggleNav: () => void,
  mutateRssPosts: () => void,
  setSelectedTrainLabel: (label: string) => void,
  checkedTrainLabels: () => TrainLabel[]
}

export const NavBar: Component<NavBarProps> = (props) => {
  const handleClickNavLink = () => {
    props.toggleNav()
    props.mutateRssPosts()
    props.setSelectedTrainLabel('')
  }

  return (
      <NavigationMenu>
        <NavigationMenu.Menu>
          <Collapsible.Trigger as='a' >
            <NavLink 
              testid='nostrposts-link'
              href='/rssposts'
              onClick={() => {
                props.setSelectedTrainLabel('nostr')
              }}
            >
              Posts
            </NavLink>
          </Collapsible.Trigger>
          <For each={props.checkedTrainLabels()}>
            {
              (trainLabel) => (
                <div class="ml-2">
                  <NavLink
                    testid={`rssposts-${trainLabel.id}-link`}
                    href={`/rssposts/${trainLabel.id}`}
                    onClick={() => handleClickNavLink()}
                  >
                    {`${trainLabel.id}`}
                  </NavLink>
                </div>
              )
            }
          </For>
          <div class="ml-2">
            <NavLink 
              testid='nostrposts-link'
              href='/nostrposts'
              onClick={() => {
                props.setSelectedTrainLabel('nostr')
              }}
            >
              Nostr&nbsp;Global
            </NavLink>
          </div>
          <div>
            Settings
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink
                testid='rssfeeds-link'
                href='/rssfeeds'
                onClick={() => handleClickNavLink()}
              >
                RSS&nbsp;Feeds
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='alby-link' href='/alby' onClick={() => handleClickNavLink()}>
                Profile
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='cors-link' href='/cors'onClick={() => handleClickNavLink()}>
                Cors&nbsp;Proxies
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='contact-link' href='/contact' onClick={() => handleClickNavLink()}>
                Contact
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='subscriptions-link' href='/subscriptions' onClick={() => handleClickNavLink()}>
                Subscriptions
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='nostrrelays-link' href='/nostrrelays' onClick={() => handleClickNavLink()}>
                Nostr&nbsp;Relays
              </NavLink>
              </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='nostrkeys-link' href='/nostrkeys' onClick={() => handleClickNavLink()}>
                Nostr&nbsp;Keys
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='classifiers-link' href='/classifiers' onClick={() => handleClickNavLink()}>
                Classifiers
              </NavLink>
            </Collapsible.Trigger>
          </div>
          <div class="ml-2">
            <Collapsible.Trigger as='a' >
              <NavLink testid='trainlabels-link' href='/trainlabels' onClick={() => handleClickNavLink()}>
                Train&nbsp;Labels
              </NavLink>
            </Collapsible.Trigger>
          </div>
        </NavigationMenu.Menu>
      </NavigationMenu>
    )
  }
export default NavBar;
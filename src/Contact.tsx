import type { Component } from 'solid-js';
import Heading from './Heading'
import { Separator } from "@kobalte/core";

const Contact: Component = () => {
  return (
    <div>
      <h1>Contact</h1>
      <Separator.Root />
      <main>
        <div>
          nostr: npub1c0le4pgu49j76fnt54xfyclkszlfrcjx2c5vvjatdfvey5sat3ws76lcvg
        </div>
        <div>
          lightning: <a href="https://getalby.com/p/cafe">cafe@getalby.com</a>
        </div>
        <div>
          github: <a href="https://github.com/colealbon/cafe-society.news">https://github.com/colealbon/cafe-society.news</a>
        </div>
        <div>
          github experimental: <a href="https://github.com/colealbon/squelch">https://github.com/colealbon/squelch</a>
        </div>
      </main>
    </div>
  )
}
export default Contact;
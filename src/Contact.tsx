import type { Component } from 'solid-js';
import { PageHeader } from './components/PageHeader'

const Contact: Component = () => {
  return (
    <div>
      <PageHeader>Contact</PageHeader>
      <main>
        <div>
          nostr: npub1c0le4pgu49j76fnt54xfyclkszlfrcjx2c5vvjatdfvey5sat3ws76lcvg
        </div>
        <div>
          lightning: <a href="https://getalby.com/p/cafe">cafe@getalby.com</a>
        </div>
        <div>
          bitcoin: bc1quyhpxj6hfm6wywulusdg9vgzpxutnuz6f54crm
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
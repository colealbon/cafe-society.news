import type { Component } from 'solid-js';
import {Link} from '@kobalte/core';
import { PageHeader } from './components/PageHeader'

const Payment: Component = () => {
  return (
    <div>
      <PageHeader>Paid Subscriptions</PageHeader>
      <main>
        <div class="ml-2em">keep our developers afloat while we build out an enterprise class automated news clipping service.</div>
        <ul>
          <li>
          Subscribe at <Link.Root href='https://buy.stripe.com/28ofZvfNY3nJaEE9AA'>$30 for 3 months</Link.Root>
          </li>
        </ul>
      </main>
    </div>
  )
}
export default Payment;
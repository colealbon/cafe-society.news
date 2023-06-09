import ReactDOM from 'react-dom/client';
import CategoryToggle from './CategoryToggle'

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('can render and update a CategoryToggle component', () => {
    ReactDOM.createRoot(container).render(<CategoryToggle />);
});


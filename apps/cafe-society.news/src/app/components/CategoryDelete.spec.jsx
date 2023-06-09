import ReactDOM from 'react-dom/client';
import CategoryDelete from './CategoryDelete'

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('can render and update a CategoryDelete component', () => {
    ReactDOM.createRoot(container).render(<CategoryDelete />);
});


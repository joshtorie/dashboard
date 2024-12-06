import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find the root element. The app requires a <div id="root"></div> element in your HTML.'
  );
}

const root = createRoot(rootElement);

root.render(
  <App />
);

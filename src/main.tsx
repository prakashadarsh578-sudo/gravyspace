import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign browser ResizeObserver loop notifications during layout reflows
window.addEventListener('error', (event) => {
  if (
    event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    event.message === 'ResizeObserver loop limit exceeded' ||
    event.message?.includes('ResizeObserver')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

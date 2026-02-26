import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reset CSS mínimo para consistência entre navegadores
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  button, input, select { font-family: inherit; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

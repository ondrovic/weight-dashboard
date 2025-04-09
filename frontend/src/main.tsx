// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/assets/styles/main.style.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
  throw new Error('Root element not found');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
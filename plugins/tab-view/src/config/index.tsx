import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// DOMの準備完了後にアプリを描画
(() => {
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();

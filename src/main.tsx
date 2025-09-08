import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Set default locale to English
if (typeof window !== 'undefined') {
  // Override browser locale for date formatting
  Object.defineProperty(navigator, 'language', {
    get: function() { return 'en-US'; }
  });
  Object.defineProperty(navigator, 'languages', {
    get: function() { return ['en-US', 'en']; }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
